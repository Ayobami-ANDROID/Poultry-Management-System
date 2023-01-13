const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")
const { prependListener } = require('../models/bird')
require('dotenv').config()

router.get('/',async (req,res) =>{
    try {
        const user = await User.find({}).select('-password')
        if(user ===[]){
            return res.send("No user found")
        }
        res.status(200).json({user})
        
    } catch (error) {
        console.log(error)
    }
})

router.post('/register',async(req,res) =>{
    try {
        let user = new User({
            name:req.body.name,
            email:req.body.email,
            phoneNo:req.body.phone,
            position:req.body.position,
            password:bcrypt.hashSync(req.body.password,10),
            Admin:req.body.Admin
        })
        user = await user.save()
        if(user){
            res.redirect('/user/login')
        }
        res.status(400).send("register user")
    } catch (error) {
        console.log(error)
    }
})

router.post('/login',async (req,res) =>{
    try {
        const user = await User.findOne({email:req.body.email})

        if(!user){
            return res.status(400).json({msg:"user not found"})
        }
    
        if(user && bcrypt.compareSync(req.body.password,user.password)){
            const token = jwt.sign({userId:user.id,username:user.email,isAdmin:user.Admin},process.env.Jwt_Secret,{expiresIn:"2h"})
            res.status(201).json({user,token:token})
        }
    } catch (error) {
        console.log(error)
    }
   
})

router.delete('/deleteUser/:id',async(req,res) =>{
    User.findByIdAndDelete({_id:req.params.id}).then(user =>{
        if(user){
            return res.status(200).json({success:true,message:'the category is deleted'})
        }else{
            return res.status(404).json({success:false,message:'category not found'})
        }
     }).catch(err =>{
        return res.status(400).json({success:false,error:err})
     })
})

router.put('/updateUser/:id',async(req,res)=>{
    const userExist = User.findById({_id:req.params.id})
    let newPassword
    if(req.body.password){
        newPassword= bcrypt.hashSync(req.body.password,10)
    }
    else{
        newPassword = userExist.passwordHash
    }
    let user = new User.findByIdAndUpdate({_id:req.params.id},{
        name:req.body.name,
        email:req.body.email,
        phoneNo:req.body.phone,
        position:req.body.position,
        password:bcrypt.hashSync(req.body.password,10),
        Admin:req.body.Admin
    },{new:true,runValidators:true})
})
     




module.exports = router