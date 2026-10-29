const mongoose = require('mongoose')
const { qualities } = require('../utils/catalogue')

const partSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a title for the part.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter a description for the part.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter a price for the part.'],
      min: [0.01, 'Price must be greater than zero.'],
    },
    category: {
      type: String,
      required: [true, 'Please choose a category.'],
      trim: true,
    },
    subcategory: { type: String, trim: true },
    condition: {
      type: String,
      required: [true, 'Please enter the condition of the part.'],
      trim: true,
    },
    carBrand: { type: String, trim: true },
    carModel: { type: String, trim: true },
    vehicleYearFrom: { type: Number, min: 1900, max: 2100 },
    vehicleYearTo: { type: Number, min: 1900, max: 2100 },
    partNumber: { type: String, trim: true },
    quality: { type: String, enum: qualities },
    location: {
      type: String,
      required: [true, 'Please enter a location.'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Please enter contact information.'],
      trim: true,
    },
    city: { type: String, trim: true },
    sellerType: { type: String, enum: ['individual', 'company'], default: 'individual' },
    imagePath: { type: String, trim: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

partSchema.path('vehicleYearTo').validate(function (value) {
  return value === undefined || this.vehicleYearFrom === undefined || value >= this.vehicleYearFrom
}, 'The ending vehicle year must be the same as or later than the starting year.')

module.exports = mongoose.model('Part', partSchema)
