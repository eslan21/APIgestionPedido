const mongoose = require("mongoose");

const ClientesSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true                   
    },
    apellido: {
        type: String,
        required: true,
        trim: true                   
    },
    empresa: {
        type: String,
        required: true,
        trim: true                   
    },
    email: {
        type: String,
        required: true,
        trim: true                   
    },
    telefono: {
        type: String,
                            //eliminamos require porque a veces no es necesario
        trim: true                   
    },
    creado: {
        type: Date,
        default: new Date()                 
    },
    vendedor: {         //Aqui identificamos el vendedor que trata este cliente
        type: mongoose.Schema.Types.ObjectId,  //Especificamos el tipo de dato
        require: true,
        ref: "Usuario"           //Especificamos de donde sacara el vendedor que lo atiende
    }

})

module.exports = mongoose.model('Clientes', ClientesSchema)