const mongoose = require('mongoose')

const companyProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    website: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    paymentMethods: { type: [String], default: [] },
    deliveryMethods: { type: [String], default: [] },
    estimatedDeliveryText: { type: String, required: true, trim: true },
    logoPath: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('CompanyProfile', companyProfileSchema)
