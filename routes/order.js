const express = require("express")
const router = express.Router()
const OrderItem = require("../models/order-item")
const Order = require("../models/order")
require('dotenv').config()

router.get('/', async(req,res)=>{
    const orderList = await Order.find({}).populate('user','name').sort({'dateOrdered': -1})

    if(!orderList){
        res.status(500).json({success:false})
    }
    res.status(200).json(orderList)
})

router.post('/createOrder',async(req,res)=>{
    
})

module.exports = router