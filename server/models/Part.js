const mongoose = require('mongoose')

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
    condition: {
      type: String,
      required: [true, 'Please enter the condition of the part.'],
      trim: true,
    },
    carBrand: { type: String, trim: true },
    carModel: { type: String, trim: true },
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
    imagePath: { type: String, trim: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Part', partSchema)
