const { gql }= require('apollo-server');


const typeDefs = gql`

type Usuario{
    id: ID
    nombre: String
    apellido: String
    email: String
    creado: String      
}

type Token {
    token : String
}
type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
}

type Cliente{
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    vendedor: ID
}

type Pedido{
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: Cliente
    vendedor: ID
    fecha: String
    estado: EstadoPedido
}
type PedidoGrupo{
    id:ID
    cantidad: Int
    nombre: String
    precio: Float

}

type TopCliente{
    total: Float
    cliente: [Cliente]
}
    type TopVendedor{
        total: Float
        vendedor:[Usuario]
    }
#---------------- Inputs----------------
input AutenticarInput{
    email: String!
    password: String!
}

input InputUsuario {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
}

input ProductoInput{
    nombre: String!
    existencia: Int!
    precio: Float!
}
input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
}
input PedidoInput {
    pedido:[PedidoProductoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
}
input PedidoProductoInput{
   id: ID
   cantidad: Int
   nombre: String
   precio: Float
}
enum EstadoPedido{
    PENDIENTE
    COMPLETADO
    CANCELADO
}
#--------------------------Query y Mutation
type Query {
    #Usuario
    obtenerUsuario : Usuario
    #Producto
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    #Clientes
    obtenerClientes: [Cliente]
    obtenerVendedorClientes: [Cliente]
    obtenercliente(id:ID!): Cliente

    #Pedidos
    obtenerPedidos : [Pedido]
    obtenerPedidoVendedor : [Pedido]
    obtenerPedidoById(id:ID!): Pedido
    obtenerPedidoEstados(estado:String!): [Pedido]

    #Consultas avanzadas
    mejoresClientes:[TopCliente]
    mejoresVendedores: [TopVendedor]
    buscarProducto(text: String!):[Producto]

}

type Mutation {
    #Usuario
    nuevoUsuario(input:InputUsuario): Usuario
    autenticarUsuario(input: AutenticarInput) : Token

    #Produtos
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id:ID! , input:ProductoInput): Producto
    eliminarProducto(id :ID!): String

    #Clientes
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id:ID!,input:ClienteInput): Cliente
    eliminarCliente(id:ID!): String

    #Pedido
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id:ID!, input:PedidoInput): Pedido
    eliminarPedido(id:ID!) : String
}

`;

module.exports = typeDefs;