const mongoose = require('mongoose');

const PedidosSchema = mongoose.Schema({
    pedido: {
        type:Array,
        require: true
    },
    total: {
        type: Number,
        require: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Clientes'
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Usuario'
    },
    estado: {
        type: String,
        default: 'PENDIENTE'
    },
    creado: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Pedidos', PedidosSchema)