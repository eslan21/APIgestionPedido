const Usuario = require('../models/Usuario');
const Productos = require('../models/Productos');
const Clientes = require('../models/Clientes');
const Pedidos = require('../models/Pedidos');

const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variable.env' });

const crearToken = (usuario, secreta, expiresIn) => {
    

    const { id, email, nombre, apellido } = usuario;

    return jwt.sign({ id,email,nombre,apellido }, secreta, { expiresIn })

}
//resolver (Se hace el llamado al servidor )

const resolvers = {
    Query: {
        obtenerUsuario: async (_, {  }, ctx) => {
            return ctx;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Productos.find({});
                return productos;
            } catch (error) {
                console.log(error)
            }
        },
        obtenerProducto: async (_, { id }) => {
            const producto = await Productos.findById(id);

            if (!producto) {
                throw new Error("Producto no existe")
            }

            return producto
        },
        obtenerClientes: async ()=>{
            
            try {
                const clientes =  await Clientes.find({});
                return clientes
            } catch (error) {
                console.log(error)
            }
            
        },
        obtenerVendedorClientes: async (_,{},ctx)=>{
           try {
            const clientes = await Clientes.find({vendedor: ctx.id.toString()})
            return clientes
           } catch (error) {
            console.log(error)
        } 
        },
        obtenercliente:async (_,{id},ctx)=>{
            //validando que existe el cliente

            const cliente = await Clientes.findById(id)
            if(!cliente){
                throw new Error('El cliente no existe');
            };

            //Validando que el cliente es un cliente del usuario que consulta

            if(cliente.vendedor.toString() !== ctx.id){   //usamos toString para pasar de objeto a string
                throw new Error('No tienes las credenciales');
            }

            //Retornando cliente
            return cliente;

        },
        obtenerPedidos: async ()=>{
            try {
                const pedidosObtenidos =   await Pedidos.find({});
                return pedidosObtenidos;
            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedidoVendedor : async (_,{},ctx)=>{
            try {
                
                const pedidosObtenidos =   await Pedidos.find({vendedor:ctx.id}).populate('cliente');
                console.log(pedidosObtenidos)
                return pedidosObtenidos;
            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedidoById : async(_,{id},ctx)=>{
            
            //verificando si pedido existe

            const pedidosObtenidos =   await Pedidos.findById(id);
            if(!pedidosObtenidos){
                throw new Error('pedido no encontrado')
            }

            //Verificar credenciales del usuario
            if(pedidosObtenidos.vendedor.toString()!== ctx.id){
                throw new Error('No tienes las credenciales')
                
            }
                return pedidosObtenidos;
        },
        obtenerPedidoEstados: async (_, {estado}, ctx)=>{

            const consultaPedido = await Pedidos.find({vendedor: ctx.id, estado:estado }); //Hay dos parameltros de busqueda
            return consultaPedido;

        },
        //CONSULTAS AVANZADAS mejores clientes
        mejoresClientes: async ()=>{
            const consultaCliente = await Pedidos.aggregate([
                {$match: {estado: "COMPLETADO"}}, //$match es una sintaxis de mongo que hace coinsidir con los que cumplan la condicion
                {
                    $group: {
                        _id: "$cliente",
                        total: {$sum: "$total"}
                    }
                },
                {
                    $lookup: {
                        from:"clientes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cliente"
                    },
                },
                {
                    $limit: 3           //limita la cantidad mostrada
                },
                {
                    $sort: {
                        total: -1       //ordena de mayor a menor
                    }
                }
            ]);

            return consultaCliente;
        },
        mejoresVendedores : async ()=>{
            const consultaVendedor = await Pedidos.aggregate([
                {
                    $match: {estado: "COMPLETADO"}
                },
                {
                    $group: {
                        _id:"$vendedor",
                        total: {$sum: "$total"}
                    }
                },
                {
                    $lookup	:{
                        from:"usuarios",
                        localField: "_id",
                        foreignField: "_id",
                        as: "vendedor"
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: {total: -1}
                }
            ]);
            return consultaVendedor;
        },
        buscarProducto : async (_, {text})=>{
            const producto = Productos.find({$text : {$search : text}}).limit(10)

            return producto;
        }
    },

    Mutation: {
        nuevoUsuario: async (_, { input }) => {

            const { email, password } = input;        //destructuramos input

            // Verificar si existe usuario//}

            const existeUsuario = await Usuario.findOne({ email })
            if (existeUsuario) {
                throw new Error('Usuario ya registrado ')
            }
            // hashear password//
            const salt = await bcript.genSalt(10)
            input.password = await bcript.hash(password, salt)

            // guardar en DB//
            try {
                const usuario = new Usuario(input)
                usuario.save()
                return usuario;

            } catch (error) {
                console.log(error)
            }
        },
        autenticarUsuario: async (_, { input }) => {

            const { email, password } = input;
            //Chequeando si existe el usuario

            const existeUsuario = await Usuario.findOne({ email });
            if (!existeUsuario) {
                throw new Error('El usuario no existe')
            }

            //revisando que el password sea correcto

            const passwordCorrecto = await bcript.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('Pasword Incorrecto')

            }

            //Crear token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h')
            }
        },
        nuevoProducto: async (_, { input }) => {
            try {
                //1) instanciando producto 
                const producto = new Productos(input)
                //2) Guardando el producto
                const resultado = await producto.save()

                return resultado
            } catch (error) {
                console.log(error)
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            //Verificando si existe
            let producto = await Productos.findById(id);  //Observe que usamos "let" en este caso.
            //Para poder reasignar la variable luego 
            //con los datos actualizados
            if (!producto) {
                throw new Error("Producto no Encontrado")
            }
            //haciendo la actualizacion

            producto = await Productos.findOneAndUpdate({ _id: id }, input, { new: true }); // _id es el nombre en base de datos

            return producto

        },
        eliminarProducto: async (_, { id }) => {
            //Verificando si existe
            let producto = await Productos.findById(id);
            if (!producto) {
                throw new Error("Producto no Encontrado")
            }
            await Productos.findOneAndDelete({_id : id}); // "_id" es el nombre en base de datos
            return "Producto eliminado"                  //String que se especifica devolver en el Schema
        },
        nuevoCliente: async (_,{input}, ctx)=>{
           //Verificando si el cliente ya existe
            const {email} = input;
            
            const cliente = await Clientes.findOne({email});

            if(cliente) throw new Error('Cliente ya registrado')

            const nuevoCliente = new Clientes(input);           //instanciando cliente
            //Asignar vendedor
            nuevoCliente.vendedor= ctx.id;
            //Guardar cliente
                try {
                    const resultado = await nuevoCliente.save()        //Guardando cliente
                    return resultado
                } catch (error) {
                    console.log(error)
                }



        },
        actualizarCliente: async (_,{id,input}, ctx)=>{
            //Verificamos que el cliente existe 
            let cliente = await Clientes.findById(id);
            if(!cliente) {
                throw new Error('Cliente no existe')
            }

            //Verificar que el vendedor es el indicado
            
            if(ctx.id !== cliente.vendedor.toString()){
                throw new Error('No tienes las credenciales de este cliente')
            }



            //Actualizandfo datos
            cliente = await Clientes.findOneAndUpdate({ _id: id }, input, { new: true }); // _id es el nombre en base de datos
            return cliente

        },

        eliminarCliente: async (_,{id,input}, ctx)=>{
            //Verificamos que el cliente existe 
            let cliente = await Clientes.findById(id);
            if(!cliente) {
                throw new Error('Cliente no existe')
            }

            //Verificar que el vendedor es el indicado
          
            if(ctx.id !== cliente.vendedor.toString()){
                throw new Error('No tienes las credenciales de este cliente')
            }

            //Eliminando cliente

            await Clientes.findOneAndDelete({ _id: id })
            return "Cliente Eliminado"
        },
        nuevoPedido: async (_, {input}, ctx)=>{

            const { cliente } = input;
            //Verificamos si cliente existe o no
            let clienteExiste = await Clientes.findById(cliente);
            if(!clienteExiste) {
                throw new Error('Cliente no existe')
            }
            //Verificamos si el cliente es del vendedor o no
            if(ctx.id !== clienteExiste.vendedor.toString()){
                throw new Error('No tienes las credenciales de este cliente')
            }

            //Revisar si el stock esta disponible
                //Nueva forma de iterar arreglos asincronos 
                for await (const articulo of input.pedido){
                    const {id} = articulo;
                    const producto = await Productos.findById(id);
                    
                    if(articulo.cantidad > producto.existencia){
                        throw new Error(`No hay suficiente cantidad del articulo ${producto.nombre}`)
                    } else {
                        producto.existencia = producto.existencia - articulo.cantidad;
                         await producto.save()
                    }
                }

            //Creando nuevo pedido
                let nuevoPedido = new Pedidos(input)
            //Asignarle un vendedor
            nuevoPedido.vendedor = ctx.id
            //Guardar en la base de datos
            const resultados = await nuevoPedido.save() 
                return resultados
                
            },   
            actualizarPedido : async (_,{id, input}, ctx)=> {
                const {cliente } = input;
                //existe pedido 
                
                const pedidoExiste = await Pedidos.findById(id)
                if(!pedidoExiste) {
                    throw new Error('Pedido no existe')
                }

                //Existe cliente
                const clienteExiste = await Clientes.findById(cliente)

                if(!clienteExiste) {
                    throw new Error('Cliente no existe')
                }
                
                //Tienes credenciales el vendedor sobre el cliente y el pedido?
                if(ctx.id !== clienteExiste.vendedor.toString()){
                    throw new Error('No tienes las credenciales de este cliente')
                }

                
                //chekeando stock
                if(input.pedido){

                    for await (const articulo of input.pedido){
                        const {id} = articulo;
                        const producto = await Productos.findById(id);
                        
                        if(articulo.cantidad > producto.existencia){
                            throw new Error(`No hay suficiente cantidad del articulo ${producto.nombre}`)
                        } else {
                            producto.existencia = producto.existencia - articulo.cantidad;
                             await producto.save()
                        }
                    }
                }
                

                //Guardar actualizacion
                const resultado = Pedidos.findOneAndUpdate({_id:id}, input, {new: true});
                return resultado;
            },
            eliminarPedido : async (_,{id}, ctx)=>{
                //Pedido existe 
                const pedidoExiste = await Pedidos.findById(id)
                if(!pedidoExiste) {
                    throw new Error('Pedido no existe')
                }

                //verificando credenciales
                if(ctx.id !== pedidoExiste.vendedor.toString()){
                    throw new Error('No posees credenciales ')

                }
                //Eliminando 

                    await Pedidos.findOneAndDelete({_id:id})
                    return 'Pedido eliminado'
                    
            }
    }
};

module.exports = resolvers;