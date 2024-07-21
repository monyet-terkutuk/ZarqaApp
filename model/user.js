const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { v4: uuidv4 } = require('uuid');  
const { model, Schema } = mongoose;

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: uuidv4,
  },
  role: {
    type: String,
    enum: ['admin', 'dropshipper', 'gudang'],
    required: true,
  },
  nama: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
  },
  telepon: {
    type: String,
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

userSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

module.exports = model('User', userSchema);
