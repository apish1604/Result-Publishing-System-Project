const mongoose=require('mongoose')
const validator=require('validator')
const connect=require('../db/mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const studentVerifySchema=new mongoose.Schema({
    rollno:{
        type:String,
        required:true,
        validate(value)
        {
            const recent=new Date()
            const currentYear = recent.getFullYear()
 
            const patt=/\d{4}[A-Z]{3}-\d{3}/
            const result = value.match(patt)
            if(!result)
                throw new Error('Invalid Rollno')
            
             const year=parseInt(value.slice(0,4))
             const batch=value.slice(4,7)
             if(year>currentYear || year<currentYear-5 || !(batch=="BCS" || batch=="IMG" || batch=="IMT" || batch=="MBA"))
                throw new Error('Enter valid rollno')

        }
    },
    otp:{
        type:Number,
        required:true
    },
    createdAt: 
    { 
        type: Date, 
        expires: 3600, 
        default: Date.now 
    },
    attemptLeft:{
        type:Number,
        default:3
    },
    tokens:[{}]
 }//,
//     {
//         timestamps: true
//     }
)
studentVerifySchema.index({createdAt: 1},{expireAfterSeconds: 3600});


const studentSchema=new mongoose.Schema({
   rollno:{
    type:String,
    required:true
   },
    publicKey:{
        type:String,
        required:true,
    },
    result:[String]
})


studentVerifySchema.methods.generateAuthToken = async function () {
     const user = this
     //Generate token
     const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')  //{expiresIn: '7 days'}
     // console.log(token)
     user.tokens = user.tokens.concat({ token })
     await user.save()

     return token
 }

const Student=mongoose.model('Student',studentSchema)
const StudentVerify=mongoose.model('StudentVerify',studentVerifySchema)

module.exports={Student,StudentVerify}
