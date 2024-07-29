// routes/product.js
const express = require('express');
const Product = require('../model/product');
const ProductType = require('../model/productType');
const router = express.Router();
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isAuthenticated } = require('../middleware/auth');
const Validator = require('fastest-validator');
const v = new Validator();


// Create Product with Product Types
router.post('', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const productSchema = {
      name: { type: "string", empty: false, max: 255 },
      color: { type: "string", empty: false, max: 255 },
      supplierId: { type: "string", optional: true, max: 255 },
      images: { type: "array", items: "string", optional: true },
      productType: {
        type: "array", items: {
          type: "object", props: {
            size: { type: "string", empty: false, max: 255 },
            price: { type: "number", positive: true },
            stock: { type: "number", integer: true },
          }
        }
      }
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, productSchema);
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

    // Create Product
    const productData = {
      name: body.name,
      color: body.color,
      supplierId: body.supplierId,
      image: body.images,
      created_by: req.user.id,
    };

    const product = await Product.create(productData);

    // Create Product Types
    const productTypesData = body.productType.map(type => ({
      size: type.size,
      price: type.price,
      stock: type.stock,
      productId: product._id,
      created_by: req.user.id,
    }));

    await ProductType.insertMany(productTypesData);

    // Calculate total stock
    const totalStock = productTypesData.reduce((acc, type) => acc + type.stock, 0);

    // Populate supplier
    await product.populate('supplierId');

    return res.status(200).json({
      id: product._id,
      name: product.name,
      images: product.image,
      supplier: product.supplierId,
      color: product.color,
      total_stock: totalStock,
      productType: productTypesData.map(type => ({
        id: type._id,
        size: type.size,
        price: type.price,
        stock: type.stock,
      }))
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get All Products
router.get('/list', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.find().populate('supplierId').sort({ created_at: -1 });
    const productList = await Promise.all(products.map(async (product) => {
      const productTypes = await ProductType.find({ productId: product._id });
      const totalStock = productTypes.reduce((acc, type) => acc + type.stock, 0);

      return {
        id: product._id,
        name: product.name,
        images: product.image,
        supplier: product.supplierId,
        color: product.color,
        total_stock: totalStock,
        productType: productTypes.map(type => ({
          id: type._id,
          size: type.size,
          price: type.price,
          stock: type.stock,
        }))
      };
    }));
    res.status(200).json({
      code: 200,
      status: 'success',
      data: productList,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Get Single Product by ID
router.get('/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplierId');
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Product not found',
      });
    }

    const productTypes = await ProductType.find({ productId: product._id });
    const totalStock = productTypes.reduce((acc, type) => acc + type.stock, 0);

    res.status(200).json({
      id: product._id,
      name: product.name,
      images: product.image,
      supplier: product.supplierId,
      color: product.color,
      total_stock: totalStock,
      productType: productTypes.map(type => ({
        id: type._id,
        size: type.size,
        price: type.price,
        stock: type.stock,
      }))
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Update Product
router.put('/update/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const productSchema = {
      name: { type: "string", empty: false, max: 255 },
      color: { type: "string", empty: false, max: 255 },
      supplierId: { type: "string", empty: false, max: 255 },
      images: { type: "array", items: "string", optional: true },
      productType: {
        type: "array", items: {
          type: "object", props: {
            size: { type: "string", empty: false, max: 255 },
            price: { type: "number", positive: true },
            stock: { type: "number", positive: true, integer: true },
          }
        }
      }
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, productSchema);
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Product not found',
      });
    }

    Object.assign(product, {
      name: body.name,
      color: body.color,
      supplierId: body.supplierId,
      image: body.images,
      updated_by: req.user.id,
      updated_at: Date.now()
    });

    await product.save();

    // Update Product Types
    await ProductType.deleteMany({ productId: product._id });

    const productTypesData = body.productType.map(type => ({
      size: type.size,
      price: type.price,
      stock: type.stock,
      productId: product._id,
      created_by: req.user.id,
      created_at: Date.now(),
    }));

    await ProductType.insertMany(productTypesData);

    const totalStock = productTypesData.reduce((acc, type) => acc + type.stock, 0);

    await product.populate('supplierId');

    res.status(200).json({
      id: product._id,
      name: product.name,
      images: product.image,
      supplier: product.supplierId,
      color: product.color,
      total_stock: totalStock,
      productType: productTypesData.map(type => ({
        id: type._id,
        size: type.size,
        price: type.price,
        stock: type.stock,
      }))
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

// Delete Product
router.delete('/delete/:id', isAuthenticated, catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'Product not found',
      });
    }

    await ProductType.deleteMany({ productId: product._id });

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;