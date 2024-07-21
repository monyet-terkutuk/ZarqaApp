const express = require('express');
const Transaksi = require('../model/transaction');
const JenisBarang = require('../model/jenisBarang');
const User = require('../model/user');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const router = express.Router();

// Create a new transaksi
router.post(
  '/create',
  catchAsyncErrors(async (req, res, next) => {
    const { id_jenisBarang, qty, subtotal, id_dropshipper, created_by } = req.body;

    const jenisBarang = await JenisBarang.findById(id_jenisBarang);
    if (!jenisBarang) {
      return next(new ErrorHandler('JenisBarang not found', 404));
    }

    const dropshipper = await User.findById(id_dropshipper);
    if (!dropshipper) {
      return next(new ErrorHandler('Dropshipper not found', 404));
    }

    const transaksi = await Transaksi.create({
      id_jenisBarang,
      qty,
      subtotal,
      id_dropshipper,
      created_by,
    });

    res.status(201).json({
      success: true,
      data: transaksi,
    });
  })
);

// Get all transaksi
router.get(
  '/',
  catchAsyncErrors(async (req, res, next) => {
    const transaksi = await Transaksi.find().populate('id_jenisBarang id_dropshipper');

    res.status(200).json({
      success: true,
      data: transaksi,
    });
  })
);

// Get a single transaksi by ID
router.get(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    const transaksi = await Transaksi.findById(req.params.id).populate('id_jenisBarang id_dropshipper');

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    res.status(200).json({
      success: true,
      data: transaksi,
    });
  })
);

// Update a transaksi
router.put(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    let transaksi = await Transaksi.findById(req.params.id);

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    transaksi = await Transaksi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: transaksi,
    });
  })
);

// Delete a transaksi
router.delete(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    const transaksi = await Transaksi.findById(req.params.id);

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    await transaksi.remove();

    res.status(200).json({
      success: true,
      message: 'Transaksi deleted successfully',
    });
  })
);

module.exports = router;
