const express = require('express');
const JenisBarang = require('../model/jenisBarang'); // Path to your JenisBarang model file
const router = express.Router();
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const Validator = require('fastest-validator');
const v = new Validator();

// Create JenisBarang
router.post('/create', isAuthenticated, async (req, res, next) => {
  try {
    const jenisBarangSchema = {
      id: { type: "string", empty: false, max: 255 },
      ukuran: { type: "number", positive: true, integer: true },
      warna: { type: "string", empty: false, max: 255 },
      price: { type: "number", positive: true },
      produkId: { type: "string", empty: false, max: 255 },
      stok: { type: "number", positive: true, integer: true },
      created_by: { type: "string", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, jenisBarangSchema);
    if (validationResponse !== true) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: {
          error: 'Validation failed',
          details: validationResponse,
        },
      });
    }

    try {
      const jenisBarang = await JenisBarang.create(body);
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: jenisBarang,
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        status: 'error',
        data: error.message,
      });
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get All JenisBarang
router.get('/list', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const jenisBarangList = await JenisBarang.find().sort({ created_at: -1 });
    res.status(200).json({
      code: 200,
      status: 'success',
      data: jenisBarangList,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get Single JenisBarang by ID
router.get('/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const jenisBarang = await JenisBarang.findById(req.params.id);
    if (!jenisBarang) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'JenisBarang not found',
      });
    }
    res.status(200).json({
      code: 200,
      status: 'success',
      data: jenisBarang,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Update JenisBarang
router.put('/update/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const jenisBarangSchema = {
      ukuran: { type: "number", positive: true, integer: true },
      warna: { type: "string", empty: false, max: 255 },
      price: { type: "number", positive: true },
      produkId: { type: "string", empty: false, max: 255 },
      stok: { type: "number", positive: true, integer: true },
      updated_by: { type: "string", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, jenisBarangSchema);
    if (validationResponse !== true) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: {
          error: 'Validation failed',
          details: validationResponse,
        },
      });
    }

    const jenisBarang = await JenisBarang.findById(req.params.id);
    if (!jenisBarang) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Jenis barang not found',
      });
    }

    Object.assign(jenisBarang, body, { updated_at: Date.now() });

    await jenisBarang.save();

    res.status(200).json({
      code: 200,
      status: 'success',
      data: jenisBarang,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Delete JenisBarang
router.delete('/delete/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const jenisBarang = await JenisBarang.findByIdAndDelete(req.params.id);

    if (!jenisBarang) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Jenis barang not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Jenis barang deleted successfully',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;
