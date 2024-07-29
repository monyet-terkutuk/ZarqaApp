const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transaksiSchema = new Schema({
  productTypeID: {
    type: Schema.Types.ObjectId,
    ref: 'ProductType',
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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grandtotal: {
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

transaksiSchema.pre('save', function(next) {
  this.grandtotal = this.subtotal * this.qty;
  next();
});

module.exports = model('Transaksi', transaksiSchema);
