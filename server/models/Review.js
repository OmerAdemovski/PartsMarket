const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: { validator: Number.isInteger, message: 'Rating must be a whole number from 1 to 5.' } },
    comment: { type: String, trim: true, maxlength: [1000, 'Comment cannot exceed 1000 characters.'], default: '' },
  },
  { timestamps: true },
)

reviewSchema.index({ order: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
