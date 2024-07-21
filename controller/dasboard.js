const express = require("express");
const Produk = require("../model/product"); // Path to your Produk model file
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require('mongoose');

// Get summary dashboard
router.get(
  "/summary",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const summary = await Produk.aggregate([
        {
          $facet: {
            totalProductCount: [
              { $count: "totalCount" }
            ],
            totalProductPrice: [
              {
                $group: {
                  _id: null,
                  totalPrice: { $sum: "$price" }
                }
              }
            ],
            todayProductCount: [
              {
                $match: {
                  created_at: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                  }
                }
              },
              { $count: "countToday" }
            ],
            successProductCountToday: [
              {
                $match: {
                  created_at: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                  },
                  status: "Selesai"
                }
              },
              { $count: "countSuccessToday" }
            ]
          }
        },
        {
          $project: {
            totalProductCount: { $arrayElemAt: ["$totalProductCount.totalCount", 0] },
            totalProductPrice: { $arrayElemAt: ["$totalProductPrice.totalPrice", 0] },
            todayProductCount: { $arrayElemAt: ["$todayProductCount.countToday", 0] },
            successProductCountToday: { $arrayElemAt: ["$successProductCountToday.countSuccessToday", 0] }
          }
        },
        {
          $project: {
            totalProductCount: { $ifNull: ["$totalProductCount", 0] },
            totalProductPrice: { $ifNull: ["$totalProductPrice", 0] },
            todayProductCount: { $ifNull: ["$todayProductCount", 0] },
            successProductCountToday: { $ifNull: ["$successProductCountToday", 0] }
          }
        }
      ]);

      res.status(200).json({
        code: 200,
        success: true,
        data: summary[0], // Because the final result is an array with a single object
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
