const express = require("express")
const router = express.Router()
const Product = require("../models/bird")
const multer = require("multer") 



const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype]
      let uploadError = new Error('Invalid image type')
      if(isValid){
        uploadError= null
      }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const upload = multer({ storage: storage })
router.get('/',async (req,res) =>{
    try {
        const product = await Product.find({})
        res.status(200).json({product},product.length)
    } catch (error) {
        console.log(error)
    }
   
})

router.post('/',upload.single('image'),async(req,res) =>{
    try {
        const file = req.file
        if(!file) return res.status(400).send("No image in the request")
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        let product = new Product({
            birdType:req.body.birdType,
            image:`${basePath}${fileName}`,
            price:req.body.price,
            status:req.body.status,
            Kilogram:req.body.Kilogram
        })

        product = await product.save()

        if(!product){
            return res.status(400).send('Product cannot be created')
        }

        res.status(201).json({product})
        
    } catch (error) {
        console.log(error)
    }
})


router.delete('/deleteUser/:id',async(req,res)=>{
    const product = await Product.findByIdAndDelete({_id:req.params.id})

   if(!product){
        return res.send('no product found')
    }
    res.send('product deleted')
})

router.put('/updateUser/:id',upload.single('image'),async(req,res)=>{
     const product = await Product.findByIdAndUpdate({_id:req.params},{
        birdType:req.body.birdType,
        image:`${basePath}${fileName}`,
        price:req.body.price,
        status:req.body.status,
        Kilogram:req.body.Kilogram
     },{new:true,runValidators:true})
     if(!product){
        return res.status(400).send('product cannot be created')
     }
     res.status(201).json({product})
})

module.exports = router