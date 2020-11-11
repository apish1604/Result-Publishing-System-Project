const jwt=require('jsonwebtoken')
const {StudentVerify}=require('../models/studentInfo')

const auth= async (req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,'thisismynewcourse')
       
        const student_v = await StudentVerify.findOne({_id:decoded._id,'tokens.token':token})
        if(!student_v)
        {
            throw new Error()
        }
        req.student=student_v 
        req.token=token
        next()
    }catch(e){
        res.status(401).send("Please authenticate.")
    }
}

module.exports=auth;