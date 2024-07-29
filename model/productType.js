const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productType = new Schema({
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    productId: {
       type: Schema.Types.ObjectId,
       ref: 'Product',
    },
    stock: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: String,
      required: true,
    },
    deleted_at: {
      type: Date,
    },
    deleted_by: {
      type: String,
    },
    updated_at: {
      type: Date,
    },
    updated_by: {
      type: String,
    },
  });
  
  module.exports = model('ProductType', productType);
  