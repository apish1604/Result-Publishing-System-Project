///Users/om/mongodb/bin/mongod.exe --dbpath=/Users/om/mongodb-data  
const express=require('express')
const cors= require('cors')

require('./db/mongoose')
const app=express()

const router = new express.Router
const homeRouter=require('./routers/home')
const userCRUDRouter=require('./routers/userCRUD')
const marksRouter=require('./routers/marks')


app.use(cors())
app.use(express.json())
app.use(homeRouter)
app.use(userCRUDRouter)
app.use(marksRouter)


const port = process.env.PORT || 3000
app.listen( port,() => {
    console.log('Server is up on port '+ port)
})

//const Admin=require('./models/admin')
//const createAdmin=async ()=>{
//    const admin=await new Admin({email: "gunashekherproddatoori@gmail.com", password: "gunaShekhar"})
//    await admin.save()
//}
//createAdmin()