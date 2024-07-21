const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transaksiSchema = new Schema({
  id_jenisBarang: {
    type: Schema.Types.ObjectId,
    ref: 'JenisBarang',
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  id_dropshipper: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming dropshipper is a user
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

module.exports = model('Transaksi', transaksiSchema);
