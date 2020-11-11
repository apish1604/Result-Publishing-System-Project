const express=require('express')
const jwt=require('jsonwebtoken')
const {Student,StudentVerify}=require('../models/studentInfo')
const Admin=require('../models/admin')
const auth=require('../middlewares/auth')
const router=new express.Router()
const sendEmail=require('../utils/sendEMail')


//Register
router.post('/register',async(req,res)=>{
    const rollno=req.body.rollno;
    const recent=new Date()
 
    try{
        const student = await Student.findOne({rollno:rollno})
        const unverifiedStudent = await StudentVerify.findOne({rollno:rollno})

        if(student)
            return res.send("Student already registered")
         //Expire otp after 15min
        if(unverifiedStudent && (recent.getTime() - unverifiedStudent.createdAt.getTime())/1000 > 15*60)
            unverifiedStudent.remove()
        else if(unverifiedStudent)
        {
            const timeLeft = Math.ceil(15 - (recent.getTime() - unverifiedStudent.createdAt.getTime())/60000)
            return res.send("Wait for " + timeLeft + "min")
        }

        //Generate Email
        const year=rollno.slice(0,4)
        const batch=rollno.slice(4,7).toLowerCase()
        const roll=parseInt(rollno.slice(8), 10);
        const email=batch+"_"+year+roll+"@iiitm.ac.in"
        
        //Send email
        const otp=await sendEmail(email)
        const newStudent = await new StudentVerify({rollno,otp});
        await newStudent.save()
    
        //Generate token
        const token=await newStudent.generateAuthToken();
        return res.status(201).send({token});
    }catch(e)
    {
        console.log(e)
        return res.send(e)
    }
   
})

//Verify Student
router.post('/verify',auth,async(req,res)=>{
    const rollno = req.student.rollno
    const otp=req.body.otp
    const publicKey=req.body.publicKey
    const recent=new Date()

    try{
        const unverifiedStudent=await StudentVerify.findOne({rollno:rollno})
        if(!unverifiedStudent)
            return res.status(404).send("Time Limit exceeded. Try registering again")
        
         
        if((recent.getTime() - unverifiedStudent.createdAt.getTime())/1000 > 15*60)
        {
            unverifiedStudent.remove()
            return res.status(404).send("Time Limit exceeded. Try registering again")
        }

        if(unverifiedStudent['attemptLeft']>0)
        {
            if(unverifiedStudent['otp']==otp)
            {
                unverifiedStudent.remove()
                const new_student=await new Student({rollno,publicKey})
                await new_student.save()

                return res.send("You has been successfully registered")
            }
            unverifiedStudent['attemptLeft']--
            await unverifiedStudent.save()

            return res.send("Wrong OTP. Try entering OTP again")
        }
        unverifiedStudent.remove()
        return res.send("No of attempts exceeded. Try registering again")
    }
    catch(e)
    {
        return res.send("Error")
    }
})

//ADMIN LOGIN
router.post('/login',async(req,res)=>{
  
    const email=req.body.email
    const password=req.body.password
    const recent=new Date()

    try{
        const admin = await Admin.findByCredentials(email,password)
        if(!admin)
        {
            return res.send("Enter valid details")
        }

        //OTP expires after 15min
        if((recent.getTime() - admin.otp.createdAt.getTime())/1000 > 15*60)
        {
                admin.otp={}
                await admin.save()
        }
        else
        {
            const timeLeft = Math.ceil(15 - (recent.getTime() - admin.otp.createdAt.getTime())/60000)
            return res.send("Wait for " + timeLeft + "min")
        }

        //Send Email
        const otp=await sendEmail(email)
        const otpObject={
            value:otp,
            createdAt:new Date(),
            attemptLeft:3
        }
        admin.otp=otpObject;
        await admin.save()

        return res.status(200).send();
    }catch(e)
    {
        return res.status(404).send(e);
    }

})

//Admin Verification
router.put('/verifyadmin',async(req,res)=>{
    const email = "kapinsangwan@gmail.com"
    const otp=req.body.otp
    const recent=new Date()

    try{
        const admin=await Admin.findOne({email})
        if(!admin)
            return res.status(404).send("Not Found")
        
        if((recent.getTime() - admin.otp.createdAt.getTime())/1000 > 15*60)
        {
            admin.otp={}
            await admin.save()
            return res.status(404).send("Time Limit exceeded. Try logging again")
        }

        if(admin.otp.attemptLeft>0)
        {
            if(admin.otp.value==otp)
            {
                admin.otp={}
                await admin.save()
                const token = await admin.generateAuthToken();
                return res.status(201).send(token)
            }
            admin.otp.attemptLeft--;
            await admin.save()
            return res.send("Wrong OTP. Try entering OTP again")
        }
        admin.otp={}
        await admin.save()
        return res.send("No of attempts exceeded. Try logging again")
    }
    catch(e)
    {
        return res.send("Error")
    }
})


module.exports=router;
