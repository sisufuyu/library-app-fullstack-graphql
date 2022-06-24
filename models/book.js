const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: {
    type: [String],
    validate: v => Array.isArray(v) && v.length > 0
  }
})

module.exports = mongoose.model('Book', bookSchema)