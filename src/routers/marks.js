const express=require('express')
const auth=require('../middlewares/auth')
const router=new express.Router()
const multer=require('multer')
const {Student,StudentVerify}=require('../models/studentInfo')
const csv=require('csvtojson')
const NodeRSA=require('node-rsa')
const adminAuth=require('../middlewares/adminAuth')
const studentAuth=require('../middlewares/studentAuth')
const upload=multer({ 
    dest: 'files', 
    limits:{
        fileSize:10000000
     },
     fileFilter(req,file,cb){  
         if(!file.originalname.match(/\.(csv)$/))
         {
             return cb(new Error('Please upload a csv file'))
         }
         cb(undefined,true)
         
    }
})
//result already uploaded or not
router.put('/addmarks',adminAuth,upload.single('file'),async(req,res)=>{
    const sem=req.body.sem
    //const sem=1
    //const key=new NodeRSA({b:1024})
    //const publicKey=key.exportKey('public')
    //const privateKey=key.exportKey('private')
    
    //const publicKey1 = '-----BEGIN PUBLIC KEY-----\n' +
    //'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIOVEp1S06yQ7waFxxfm3Ep6MX\n' +
    //'GUMiFRAUtZnT/pTq7s6gGXpwgtxNwu+tNd3GCJXR97nPovJzew3KPmUbgBkanzc6\n' +                                                        
    //'KHY8TaOb+vU41IazXNeuR5uTyohZ+u2FnrwshrtFeR7e2Pqgf7S2jBi+H2zQOrYe\n' +                                                        
    //'8SbMK++UEnkhjxiw1QIDAQAB\n' +
    //'-----END PUBLIC KEY-----'
   
   const privateKey1 = '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICXQIBAAKBgQDIOVEp1S06yQ7waFxxfm3Ep6MXGUMiFRAUtZnT/pTq7s6gGXpw\n' +                                                        
    'gtxNwu+tNd3GCJXR97nPovJzew3KPmUbgBkanzc6KHY8TaOb+vU41IazXNeuR5uT\n' +                                                        
    'yohZ+u2FnrwshrtFeR7e2Pqgf7S2jBi+H2zQOrYe8SbMK++UEnkhjxiw1QIDAQAB\n' +                                                        
    'AoGAPtZ+OnrE7yYaoiiemp/rI0TZUm6DOzcRDO7RkE7dvb2k62oTmyv2qBD914aI\n' +                                                        
    'S5Z2LqdokVm6bbO46Dgc0zyoo7woQQj5dq4Fk1awkzJY+cKwcP5I4j/qDeBk9gEP\n' +                                                        
    'qGYS152FwcQsBm12TjuzHeQG/URthVwwte2jHv64iBqJjyECQQDjMfdNKgRwLODD\n' +                                                        
    'Bq4EVeOfb+tPs+mZRAVgyUk2PlLO0OoxbMIZcr87PCMCeqWPwucIRJnloSzxhfJN\n' +                                                        
    '+oeKXwYfAkEA4Zvy4okPpPQTYuX0nz+yOIx1N+gOc6DCzEpkXHj0CKDNL6HKk78c\n' +                                                        
    'Mhc/ksLq98Fk0rhLEp2XrmavyMgzOMfiiwJBAN/NIp1CnKibrLSw6c6fhOBT8WrM\n' +                                                        
    'AXrXBK042wOyFQRhy7DwP6ut2y7QqHQSuPCKv+bnHOqVAJ7SocOq3MWzoWUCQQCV\n' +                                                        
    'LC0z1lZuxifPW6ccaNxpgY278ocjsyc6NvIXJq6Mye4B0aOFf3agNDkHzDPar5f/\n' +                                                        
    'sHWLEIKLgUA3rRAZOikzAkA7kxI9tsv4SC+Bcdtq7Rz7fpwxag6+KYn/vLgsLGlo\n' +                                                        
    'Mbb2gIzSHjXsF8P5gBTFMVrQKfOG6z6p8vuFu3/h7xaE\n' +                                                                            
    '-----END RSA PRIVATE KEY-----'
    
    
    const private_key = new NodeRSA(privateKey1)
    console.log("hi")
    if(isNaN(sem) || sem>10 || sem<=0)
        return res.send("Enter a valid semester number")
 
   csv()
   .fromFile(req.file.path)
   .then(async (jsonObj)=>
   {
   console.log(jsonObj)
   console.log(jsonObj.length)
        for(let i=0;i<jsonObj.length;i++)
        {
        console.log("hi")
            let rollno=jsonObj[i].Rollno
            console.log(rollno)
            let result=JSON.stringify(jsonObj[i])
            console.log(result)
            let student=await Student.findOne({rollno})
            console.log(student)
            let public_key = new NodeRSA(student.publicKey)
            console.log("hi")
            let encrypted_result = public_key.encrypt(result , 'base64');
            console.log(encrypted_result)
            if(student)
            {
                //incase administration skipped result of any sem in between
                while(student.result.length < sem-1)
                {
                    student.result.push("")
                    await student.save()
                }

                //if(student.result.length >= sem && student.result[sem-1] != "")
                    //return res.send("Result already uploaded")

                //overwrite result, if it is already uploaded
                if(student.result.length >= sem)
                {
                    student.result.set(sem-1,encrypted_result)

                    await student.save()
                    return res.send("Successfully uploaded the marks")

                }
                else
                {
                    student.result.push(encrypted_result)
                    await student.save()
                    return res.send("Successfully uploaded the marks")

                }
                
            }
        }
        //let student=await Student.findOne({rollno:"2018BCS-025"})
        //const decryptedString = private_key.decrypt(student.result[0] , 'utf8')

    }).catch((e)=>{
    return res.send(e)
})

})

router.get('/result',studentAuth,async(req,res)=>{

    const rollno = req.query.rollno
    const sem = req.query.semester
    try{
        if(isNaN(sem) || sem<=0 || sem>10)
            throw new Error("Enter a valid semester number")
        const student=await Student.findOne({rollno})
        if(!student)
            return res.status(404).send("Student not registered")
        if(student.result.length < sem)
            return res.status(404).send("Result is not out yet")

        return res.send(student.result[sem-1])
    }catch(e)
    {
        return res.status(501).send(e)
    }
})

module.exports=router;