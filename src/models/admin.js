const mongoose=require('mongoose')
const validator=require('validator')
const connect=require('../db/mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const Schema=mongoose.Schema

const adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Invalid Email!')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true
    },
    otp:{
        value:Number,
        createdAt: { 
            type: Date,
            default:"2018-01-01"
        },
        attemptLeft:{
        type:Number
        
        }
    },
    tokens:[{}]
 }
)

adminSchema.methods.toJSON= function(){
    const user=this;
    const userObject=user.toObject() 
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

adminSchema.methods.generateAuthToken = async function () {
    const user = this
    //Generate token
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse', {expiresIn: 3600}) 
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

adminSchema.statics.findByCredentials=async (email,password)=>{
    const user=await Admin.findOne({email})
    if(!user){
        throw new Error("Unable to login")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    
    if(!isMatch){
        throw new Error('Password Mismatch')
    }
    return user;
}

adminSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next();
})

const Admin=mongoose.model('Admin',adminSchema)
module.exports=Admin