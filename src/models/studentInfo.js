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
    password:{
          type:String,
          required:true
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
   password:{
          type:String,
          required:true
   },
    publicKey:{
        type:String,
        required:true,
    },
    result:[String],
    tokens:[{}]
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

studentVerifySchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next();
})

 studentSchema.methods.generateAuthToken = async function () {
    const user = this
    //Generate token
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse', {expiresIn: 7*60*60})
    console.log(token)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

studentSchema.statics.findByCredentials=async (rollno,password)=>{
    const user=await Student.findOne({rollno})
    
    if(!user){
        throw new Error("Unable to login")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Password Mismatch')
    }
    return user;
}

//studentSchema.pre('save',async function(next){
//    const user=this;
//    if(user.isModified('password')){
//        user.password=await bcrypt.hash(user.password,8)
//    }
//    next();
//})

const Student=mongoose.model('Student',studentSchema)
const StudentVerify=mongoose.model('StudentVerify',studentVerifySchema)

module.exports={Student,StudentVerify}
