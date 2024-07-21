const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const supplierSchema = new Schema({
    id: {
      type: String,
      required: true,
    },
    nama: {
      type: String,
      required: true,
    },
    alamat: {
      type: String,
      required: true,
    },
    telepon: {
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
  
  module.exports = model('Supplier', supplierSchema);
  