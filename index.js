const {ApolloServer}= require('apollo-server');
const resolvers = require('./db/resolvers')
const typeDefs = require('./db/schema');
const jwt = require('jsonwebtoken')    //Importamos JWT
require('dotenv').config({ path: 'variable.env' }); //variables de entorno


const conectarDB = require('./config/db')

//api similada
 

conectarDB()


//servidor

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{

       // console.log(req.headers)

       const token = req.headers['authorization'] || "";     
        //verificamos que el @token sea valido
        if(token){

            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                console.log(usuario)
                return usuario
            } catch (error) {
              console.log('Hubo un error')  
              console.log(error)  
            } 
        }

    }
});


server.listen().then(({url})=>{
console.log(`Servidor listo en la URL ${url}`)
});