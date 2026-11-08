const mongoose = require('mongoose')

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    website: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    paymentMethods: { type: [{ type: String, enum: ['cash-on-delivery', 'pay-at-pickup', 'bank-transfer'] }], required: true, validate: { validator: (methods) => methods.length > 0, message: 'Choose at least one payment method.' } },
    deliveryMethods: { type: [{ type: String, enum: ['company-delivery', 'pickup'] }], required: true, validate: { validator: (methods) => methods.length > 0, message: 'Choose at least one delivery method.' } },
    estimatedDeliveryText: { type: String, required: true, default: 'Contact company', trim: true },
    logoPath: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)
