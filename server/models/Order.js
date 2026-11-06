const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
    productSnapshot: {
      title: { type: String, required: true },
      imagePath: String,
      partNumber: String,
      brand: String,
      model: String,
    },
    companySnapshot: {
      companyName: { type: String, required: true },
      address: String,
      phone: String,
      email: String,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryMethod: { type: String, enum: ['company-delivery', 'pickup'], required: true },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, trim: true },
    buyerPhone: { type: String, required: true, trim: true },
    buyerNotes: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'accepted', 'preparing', 'ready-for-pickup', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    stockRestored: { type: Boolean, default: false },
    cancelledAt: Date,
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)
