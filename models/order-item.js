const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    quantity:{
        type:Number,
        required:true,
    },
    Product:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"bird",
    }
})

module.exports = new mongoose.model("OrderItem",orderItemSchema)