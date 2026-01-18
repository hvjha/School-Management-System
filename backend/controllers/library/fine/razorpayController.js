import asyncHandler from "express-async-handler";
import razorpay from "../../../config/razorpay.js";
import crypto from "crypto";
import bookIssueModel from "../../../models/library/bookIssueModel.js";
import FinePayment from "../../../models/library/payFineModel.js";
import mongoose from "mongoose";

// Create Razorpay Order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { amount, issueIds } = req.body;

    if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
    }

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        throw new Error("issueIds are required");
    }

    if (process.env.USE_MOCK_PAYMENT === 'true') {
        return res.status(200).json({
            success: true,
            order: {
                id: `mock_order_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency: "INR",
            },
            isMock: true
        });
    }

    const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({
            success: false,
            message: "Razorpay order creation failed. Check if keys are correct.",
            error: error.message,
        });
    }
});

// Verify Razorpay Payment and Update Records
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        issueIds,
        amount,
    } = req.body;

    let isAuthentic = false;

    if (process.env.USE_MOCK_PAYMENT === 'true') {
        isAuthentic = true;
    } else {
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update book issues as fine paid
            await bookIssueModel.updateMany(
                { _id: { $in: issueIds } },
                { $set: { finePaid: true } },
                { session }
            );

            // Create fine payment record
            const payment = await FinePayment.create(
                [
                    {
                        students: req.user._id, // Assuming student is the one paying or the context is known
                        issues: issueIds,
                        amount: amount,
                        paymentMode: "online",
                        paymentGateway: "razorpay",
                        transactionId: razorpay_payment_id,
                        status: "success",
                        collectedBy: req.user._id, // If admin is collecting, otherwise modify accordingly
                    },
                ],
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                success: true,
                message: "Payment verified and recorded successfully",
                receiptId: payment[0]._id,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({
                success: false,
                message: "Failed to record payment after verification",
                error: error.message,
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid payment signature",
        });
    }
});
