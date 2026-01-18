import asyncHandler from "express-async-handler"
import FinePayment from "../../../models/library/payFineModel.js"
import PDFDocument from "pdfkit";

export const downloadFineReceipt = asyncHandler(async (req, res) => {
  const { receiptId } = req.params;

  const receipt = await FinePayment.findById(receiptId)
    .populate("student", "name email")
    .populate({
      path: "issues",
      populate: { path: "book", select: "title isbn" },
    })
    .populate("collectedBy", "name email");

  if (!receipt) {
    return res.status(404).json({ success: false, message: "Receipt not found" });
  }

  // 🔐 Student access control
  if (
    req.user.role === "student" &&
    receipt.student._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Fine_Receipt_${receipt._id}.pdf`
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(18).text("Library Fine Payment Receipt", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Receipt ID: ${receipt._id}`);
  doc.text(`Student: ${receipt.student.name}`);
  doc.text(`Payment Date: ${receipt.createdAt.toDateString()}`);
  doc.text(`Payment Mode: ${receipt.paymentMode}`);
  if (receipt.transactionId) {
    doc.text(`Transaction ID: ${receipt.transactionId}`);
  }

  doc.moveDown();
  doc.text("Books & Fine", { underline: true });

  receipt.issues.forEach((issue, index) => {
    doc.text(
      `${index + 1}. ${issue.book.title} (ISBN: ${issue.book.isbn}) - ₹${issue.fine}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Paid: ₹${receipt.amount}`, { align: "right" });

  doc.moveDown(2);
  doc.fontSize(10).text("System Generated Receipt", { align: "center" });

  doc.end();
});
