const mongoose = require('mongoose');

const UsuariosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true                      //elimina espacion al final e inicio
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true                //valor unico
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    creado: {
        type: Date,
         default: Date.now()                //valor por defecto
    },
})

module.exports = mongoose.model('Usuario', UsuariosSchema)