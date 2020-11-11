const nodemailer = require('nodemailer');

var email;
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
     //host: "smtp.gmail.com",
     //port: 465,
    // secure: true,
    //service: 'gmail',
    auth: {
      user: 'resultpublishingsystem@gmail.com',
      pass: 'kapinsangwan#'
    }
  });

const sendEmail=async (email)=>{
    //Generate OTP
    let otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);
    console.log(otp);
     
    // Send mail with defined transport object
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };

     transporter.sendMail(mailOptions,async (error, info) => {
        if (error) {
            throw new Error(error);
        }
        //console.log('Message sent: %s', info.messageId);   
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
     });
     return otp;
}
module.exports=sendEmail
