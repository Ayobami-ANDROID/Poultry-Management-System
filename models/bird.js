const mongoose = require("mongoose");

const birdSchema = new mongoose.Schema({})

module.exports = mongoose.model("bird",birdSchema)