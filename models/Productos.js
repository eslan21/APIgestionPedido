const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true                      //elimina espacion al final e inicio
    },
    existencia: {
        type: Number,
        required: true,
        trim: true                      //elimina espacion al final e inicio
    },
    precio: {
        type: Number,
        required: true,
        trim: true                      //elimina espacion al final e inicio
    },
    creado: {
        type: Date,
        default: Date.now()                     //elimina espacion al final e inicio
    },
})
//-creando un indice para hacer busquedas
ProductosSchema.index({nombre: "text"})  //Creamos un indice de el valor nombre y de tipo texto

module.exports = mongoose.model('Productos', ProductosSchema)