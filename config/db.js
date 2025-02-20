const mongoose = require('mongoose')
require('dotenv').config({path:'variable.env'});

const connectarDB = async ()=>{

    try {
        await mongoose.connect(process.env.DB_MONGO,{
           
        })
        console.log('DB Conectada')
    } catch (error) {
        console.log('hubo un error')
        console.log(error)
        process.exit(1)    //detener la app
    }
}

module.exports = connectarDB;