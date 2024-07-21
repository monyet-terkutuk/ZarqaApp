const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const jenisBarangSchema = new Schema({
    id: {
      type: String,
      required: true,
    },
    ukuran: {
      type: Number,
      required: true,
    },
    warna: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    produkId: {
       type: Schema.Types.ObjectId,
       ref: 'Produk',
    },
    stok: {
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
  
  module.exports = model('JenisBarang', jenisBarangSchema);
  