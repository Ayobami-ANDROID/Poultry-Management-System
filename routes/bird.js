const express = require("express")
const router = express.Router()
const Product = require("../models/bird")


router.get('/',async (req,res) =>{
    try {
        const product = await Product.find({})
        res.status(200).json({product})
    } catch (error) {
        
    }
   
})

module.exports = router