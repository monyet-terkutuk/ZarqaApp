const express = require('express');
const Supplier = require('../model/supplier'); // Path to your Supplier model file
const router = express.Router();
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const Validator = require('fastest-validator');
const v = new Validator();

// Create Supplier
router.post('', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const supplierSchema = {
      name: { type: "string", empty: false, max: 255 },
      address: { type: "string", empty: false, max: 255 },
      phone: { type: "string", empty: false, max: 20 },
      email: { type: "email", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, supplierSchema);
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

    const supplierData = {
      ...body,
      created_by: req.user.id,
    };

    const supplier = await Supplier.create(supplierData);

    return res.status(200).json({
      code: 200,
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get All Suppliers
router.get('/list', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().sort({ created_at: -1 });
    res.status(200).json({
      code: 200,
      status: 'success',
      data: suppliers,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get Single Supplier by ID
router.get('/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Supplier not found',
      });
    }
    res.status(200).json({
      code: 200,
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Update Supplier
router.put('/update/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const supplierSchema = {
      name: { type: "string", empty: false, max: 255 },
      address: { type: "string", empty: false, max: 255 },
      phone: { type: "string", empty: false, max: 20 },
      email: { type: "email", empty: false, max: 255 },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, supplierSchema);
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

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Supplier not found',
      });
    }

    Object.assign(supplier, body, { updated_by: req.user.id, updated_at: Date.now() });

    await supplier.save();

    res.status(200).json({
      code: 200,
      status: 'success',
      data: supplier,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Delete Supplier
router.delete('/delete/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Supplier not found',
      });
    }

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;
