const jwt=require('jsonwebtoken')
const Admin=require('../models/admin')

const adminAuth = async (req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,'thisismynewcourse')
        const admin = await Admin.findOne({_id:decoded._id,'tokens.token':token})
        if(!admin)
        {
            throw new Error("Admin not found")
        }
        req.token=token
        next()
    }catch(e){
        res.status(401).send("Please authenticate.")
    }
}
module.exports=adminAuth;