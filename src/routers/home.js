const express=require('express')
const router=new express.Router()

router.get('/',async(req,res)=>{
    try
    {
        return res.status(200).send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }   
})

module.exports=router