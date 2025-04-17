const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  transactionUUID: {
    type: String,
    required: true,
    unique: true
  },
  productCode: {
    type: String,
    required: true,
    default: 'EPAYTEST'
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETE', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  referenceId: String,
  esewaResponse: Object,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);