const express = require('express');
const Transaksi = require('../model/transaction');
const ProductType = require('../model/productType');
const Product = require('../model/product');
const User = require('../model/user');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// Create a new transaksi
router.post(
  '',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { productTypeID, qty, subtotal, userId } = req.body;

    const productType = await ProductType.findById(productTypeID).populate('productId');
    if (!productType) {
      return next(new ErrorHandler('ProductType not found', 404));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    const grandtotal = subtotal * qty;

    const transaksi = await Transaksi.create({
      productTypeID,
      qty,
      subtotal,
      grandtotal,
      userId,
      created_by: req.user.id,
    });

    const populatedTransaksi = await Transaksi.findById(transaksi._id).populate({
      path: 'productTypeID',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    }).populate('userId');

    res.status(201).json({
      success: true,
      data: populatedTransaksi,
    });
  })
);

// Get all transaksi
router.get(
  '/list',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const transaksiList = await Transaksi.find()
      .populate({
        path: 'productTypeID',
        populate: {
          path: 'productId',
          model: 'Product'
        }
      })
      .populate('userId')
      .lean();

    const response = transaksiList.map(transaksi => ({
      id: transaksi._id,
      product_type: {
        id: transaksi.productTypeID._id,
        size: transaksi.productTypeID.size,
        price: transaksi.productTypeID.price,
        product: {
          id: transaksi.productTypeID.productId._id,
          name: transaksi.productTypeID.productId.name,
          color: transaksi.productTypeID.productId.color,
          supplierId: transaksi.productTypeID.productId.supplierId,
          image: transaksi.productTypeID.productId.image,
          created_by: transaksi.productTypeID.productId.created_by,
          created_at: transaksi.productTypeID.productId.created_at,
        },
        stock: transaksi.productTypeID.stock,
        created_by: transaksi.productTypeID.created_by,
        created_at: transaksi.productTypeID.created_at,
      },
      qty: transaksi.qty,
      subtotal: transaksi.subtotal,
      user: {
        id: transaksi.userId._id,
        role: transaksi.userId.role,
        name: transaksi.userId.name,
        password: transaksi.userId.password, // Be cautious about sending passwords
        outlet_name: transaksi.userId.outlet_name,
        address: transaksi.userId.address,
        phone: transaksi.userId.phone,
        email: transaksi.userId.email,
        created_by: transaksi.userId.created_by,
        created_at: transaksi.userId.created_at,
        user_id: transaksi.userId.user_id,
      },
      grandtotal: transaksi.grandtotal,
      created_by: transaksi.created_by,
      created_at: transaksi.created_at,
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  })
);


// Get a single transaksi by ID
router.get(
  '/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const transaksi = await Transaksi.findById(req.params.id)
      .populate({
        path: 'productTypeID',
        populate: {
          path: 'productId',
          model: 'Product'
        }
      })
      .populate('userId')
      .lean();

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    const response = {
      id: transaksi._id,
      product_type: {
        id: transaksi.productTypeID._id,
        size: transaksi.productTypeID.size,
        price: transaksi.productTypeID.price,
        product: {
          id: transaksi.productTypeID.productId._id,
          name: transaksi.productTypeID.productId.name,
          color: transaksi.productTypeID.productId.color,
          supplierId: transaksi.productTypeID.productId.supplierId,
          image: transaksi.productTypeID.productId.image,
          created_by: transaksi.productTypeID.productId.created_by,
          created_at: transaksi.productTypeID.productId.created_at,
        },
        stock: transaksi.productTypeID.stock,
        created_by: transaksi.productTypeID.created_by,
        created_at: transaksi.productTypeID.created_at,
      },
      qty: transaksi.qty,
      subtotal: transaksi.subtotal,
      user: {
        id: transaksi.userId._id,
        role: transaksi.userId.role,
        name: transaksi.userId.name,
        password: transaksi.userId.password, // Be cautious about sending passwords
        outlet_name: transaksi.userId.outlet_name,
        address: transaksi.userId.address,
        phone: transaksi.userId.phone,
        email: transaksi.userId.email,
        created_by: transaksi.userId.created_by,
        created_at: transaksi.userId.created_at,
        user_id: transaksi.userId.user_id,
      },
      grandtotal: transaksi.grandtotal,
      created_by: transaksi.created_by,
      created_at: transaksi.created_at,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  })
);


// Update a transaksi
router.put(
  '/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    let transaksi = await Transaksi.findById(req.params.id);

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    Object.assign(transaksi, req.body, { updated_at: Date.now(), updated_by: req.user.id });

    await transaksi.save();

    const populatedTransaksi = await Transaksi.findById(transaksi._id).populate({
      path: 'productTypeID',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    }).populate('userId');

    res.status(200).json({
      success: true,
      data: populatedTransaksi,
    });
  })
);

// Delete a transaksi
router.delete(
  '/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const transaksi = await Transaksi.findById(req.params.id);

    if (!transaksi) {
      return next(new ErrorHandler('Transaksi not found', 404));
    }

    transaksi.deleted_at = Date.now();
    transaksi.deleted_by = req.user.id;

    await transaksi.save();

    res.status(200).json({
      success: true,
      message: 'Transaksi deleted successfully',
    });
  })
);

module.exports = router;
