const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    // required: true,
  },
  image: [String],
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

module.exports = model('Product', productSchema);
