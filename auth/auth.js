const jwt = require("jsonwebtoken")
require("dotenv").config()

const verifyToken = (req,res,next) =>{
    const authHeader = req.headers.authorization
    if(!authHeader || authHeader.startsWith('Bearer')){
        return res.status(400).send('you are not authorized to this route')
    }
    const token = authHeader.split('')[1]
    try {
        const payload = jwt.verify(token,Jwt_Secret)
        req.user = {userId: payload.userId, name: payload.username,isAdmin:payload.isAdmin}
    } catch (error) {
        
    }
}

const verifyTokenAndAdmin = (req,res,next) =>{
    verifyToken(req,res,()=>{
         if(req.user.isAdmin){
            next()
         }else{
            res.status(403).send("This route is only accessible to the Admin")
         }
    })
}

module.exports = {verifyToken,verifyTokenAndAdmin}