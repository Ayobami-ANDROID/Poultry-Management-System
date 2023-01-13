const mongoose = require("mongoose")

const farmerSchema  = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"The name of farmer is required"]
    },
    phoneNo:{
        type:String,
    },
    position:{
        type:String,
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    Admin:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("farmer",farmerSchema)