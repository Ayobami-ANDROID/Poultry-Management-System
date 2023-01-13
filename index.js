const express = require("express");
const app = express()
const connectDB = require('./connectDB/connectDb')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const mongoose = require('mongoose')
const User = require('./routes/user')
const Product = require('./routes/bird')
require("dotenv").config()
mongoose.set('strictQuery', false)
app.set('trust proxy',1)

const port = process.env.PORT || 8080

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(rateLimiter({
  windowMs:15*60*1000,
  max:100,
}))

app.use('/user',User) 
app.use('/product',Product)

const start = async () =>{
    await connectDB(process.env.Mongo_Url)
    app.listen(port,()=>{
        console.log(`listening on ${port}`)
    })
}
start()