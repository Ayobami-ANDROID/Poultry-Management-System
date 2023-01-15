const express = require("express")
const router = express.Router()
const OrderItem = require("../models/order-item")
const Order = require("../models/order")
const stripe = require('stripe')(process.env.Secret_Key)
require('dotenv').config()

router.get('/', async(req,res)=>{
    const orderList = await Order.find({}).populate('user','name').sort({'dateOrdered': -1})

    if(!orderList){
        res.status(500).json({success:false})
    }
    res.status(200).json(orderList)
})

router.post('/createOrder',async(req,res)=>{
    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = OrderItem({
            quantity:orderItem.quantity,
            Product:orderItem.product
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    const orderItemsIdsResolved = await orderItemIds

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) =>{
        const orderItem = await  OrderItem.findById(orderItemId).populate('product','price ')
        const totalPrice = orderItem.product.price*orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b)=>a+b,0)

    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: 'NGN',
      })

    let order = new Order({
         orderItems:orderItemsIdsResolved,
         shippingAddress1:req.body.shippingAddress,
         city:req.body.city,
         zip:req.body.zip,
         country:req.body.country,
         phone:req.body.phone,
         status:req.body.status,
         totalPrice:totalPrice,
         user : req.body.user
    })
    order = await order.save()
    if(!order){
        return res.status(404).send('the category cannot be created!')
    }
    res.status(200).json({order,paymentIntentId:paymentIntent.client_secret})
})

module.exports = router