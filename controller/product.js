const express = require('express');
const Produk = require('../model/product'); // Path to your produk model file
const router = express.Router();
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const Validator = require('fastest-validator');
const v = new Validator();

// Create Produk
router.post('/create', isAuthenticated, async (req, res, next) => {
  try {
    const produkSchema = {
      id: { type: "string", empty: false, max: 255 },
      nama: { type: "string", empty: false, max: 255 },
      stok: { type: "number", positive: true, integer: true },
      suplierId: { type: "string", empty: false, max: 255 },
      image: { type: "array", items: "string", optional: true },
      created_by: { type: "string", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, produkSchema);
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
      const produk = await Produk.create(body);
      return res.status(200).json({
        code: 200,
        status: 'success',
        data: produk,
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

// Get All Produk
router.get('/list', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const produkList = await Produk.find().sort({ created_at: -1 });
    res.status(200).json({
      code: 200,
      status: 'success',
      data: produkList,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get Single Produk by ID
router.get('/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const produk = await Produk.findById(req.params.id);
    if (!produk) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Produk not found',
      });
    }
    res.status(200).json({
      code: 200,
      status: 'success',
      data: produk,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Update Produk
router.put('/update/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const produkSchema = {
      nama: { type: "string", empty: false, max: 255 },
      stok: { type: "number", positive: true, integer: true },
      suplierId: { type: "string", empty: false, max: 255 },
      image: { type: "array", items: "string", optional: true },
      updated_by: { type: "string", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, produkSchema);
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

    const produk = await Produk.findById(req.params.id);
    if (!produk) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Produk not found',
      });
    }

    Object.assign(produk, body, { updated_at: Date.now() });

    await produk.save();

    res.status(200).json({
      code: 200,
      status: 'success',
      data: produk,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Delete Produk
router.delete('/delete/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const produk = await Produk.findByIdAndDelete(req.params.id);

    if (!produk) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Produk not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Produk deleted successfully',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;
