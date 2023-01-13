const mongoose = require("mongoose");

const birdSchema = new mongoose.Schema({
    birdType:{
        type:String,
    },
    image:{
        type:String,
        default:'',
    },
    price:{
       type:String,
    },
    status:{
        type:String,
        default:"available",
        enum:["available","sold out"]
    }
})

module.exports = mongoose.model("bird",birdSchema)