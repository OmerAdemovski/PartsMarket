const mongoose = require('mongoose')
const { COMPLAINT_CATEGORIES } = require('../utils/complaintCategories')

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['buyer', 'company'], required: true },
    message: { type: String, required: true, trim: true, maxlength: [2000, 'Message cannot exceed 2000 characters.'] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const complaintSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
    category: { type: String, enum: COMPLAINT_CATEGORIES, required: true },
    subject: { type: String, required: true, trim: true, maxlength: [120, 'Subject cannot exceed 120 characters.'] },
    status: { type: String, enum: ['open', 'in-discussion', 'resolved'], default: 'open' },
    messages: { type: [messageSchema], required: true, validate: { validator: (messages) => messages.length > 0, message: 'A complaint needs an opening message.' } },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Complaint', complaintSchema)
