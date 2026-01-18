import asyncHandler from "express-async-handler";
import FinePayment from "../../../models/library/payFineModel.js";


export const fineAnalytics = asyncHandler(async (req, res) => {
  const data = await FinePayment.aggregate([
    {
      $group: {
        _id: "$paymentMode",
        totalCollected: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    analytics: data
  });
});
