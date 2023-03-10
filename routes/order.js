const express = require("express")
const router = express.Router()
const OrderItem = require("../models/order-item")
const Order = require("../models/order")
const stripe = require('stripe')(process.env.Secret_Key)
const nodemailer = require("nodemailer")
const {verifyToken,verifyTokenAndAdmin} = require("../auth/auth")
require('dotenv').config()

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD ,
    }

})

router.get('/', verifyTokenAndAdmin,async(req,res)=>{
    const orderList = await Order.find({}).populate('user','name').sort({'dateOrdered': -1})

    if(!orderList){
        res.status(500).json({success:false})
    }
    res.status(200).json(orderList)
})

router.post('/createOrder',verifyToken,async(req,res)=>{
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
        const orderItem = await  OrderItem.findById(orderItemId).populate('Product','price ')
        const totalPrice = orderItem.Product.price*orderItem.quantity
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

router.put('/updateOrder/:id',verifyToken,async(req,res)=>{
    const order = new Order.findByIdAndUpdate({_id:req.params.id},{
        status:req.body.status
    },{new:true,runValidators:true})
    if(!order){
       return  res.status(400).json({message:'The order not be updated'})
    }
    res.status(200).json({order})
})

router.delete('/:id',verifyToken,async(req,res)=>{
    Order.findByIdAndDelete({_id:req.params.id}).then(async order =>{
       if(order){
           await order.orderItems.map(async orderItem =>{
            await OrderItem.findByIdAndRemove(orderItem)
           })
           return res.status(200).json({success:true,message:'the category is deleted'})
       }else{
           return res.status(404).json({success:false,message:'category not found'})
       }
    }).catch(err =>{
       return res.status(400).json({success:false,error:err})
    })
   })

   router.get('/get/totalsales',verifyTokenAndAdmin,async (req,res)=>{
    const totalSales = await Order.aggregate([
       {$group:{_id:null,totalSales:{$sum:'$totalPrice'}}}
    ])
    if(!totalSales){
       return res.status(400).send('The order sales cannot be generated')
    }
    res.status(200).json({totalSales:totalSales.pop().totalSales})
})
   

module.exports = router