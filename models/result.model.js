const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  titleEn: {
    type: String,
    required: true,
  },
  titleRu: {
    type: String,
    required: true,
  },
  descriptionEn: {
    type: String,
  },
  descriptionRu: {
    type: String,
  },
});

module.exports = mongoose.model("Result", resultSchema);
