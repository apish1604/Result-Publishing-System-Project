const mongoose=require('mongoose')
const connection ="mongodb+srv://kapinsangwan:kapinsangwan@resultpublishingapplica.3rlzz.mongodb.net/rpsdatabase?retryWrites=true&w=majority"
mongoose.connect(connection,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
})

//ResultPublishing-api