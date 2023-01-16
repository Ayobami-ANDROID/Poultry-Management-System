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
       type:Number,
    },
    status:{
        type:String,
        default:"available",
        enum:["available","sold out"]
    },
    Kilogram:{
         type:Number,
    }
})

module.exports = mongoose.model("bird",birdSchema)