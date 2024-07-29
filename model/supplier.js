const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const supplierSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    }
  });
  
  module.exports = model('Supplier', supplierSchema);
  