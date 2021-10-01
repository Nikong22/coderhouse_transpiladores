import * as express from "express";
const app = express();

const PORT = 8080;
import * as http from 'http'
const server = http.createServer(app);
import * as socketio from "socket.io";
const io = new socketio.Server(server);

import * as fs from 'fs'

app.use(express.static('public'));

server.listen(PORT,
    () => console.log('escuchando...'));
server.on('error', error=>console.log('Error en servidor', error));

const productos = [
];

const mensajes = [
];

const getSiguienteId = ( productos ) => {
    let ultimoId = 0
    productos.forEach(producto => {
    if (producto.id > ultimoId){
        ultimoId = producto.id
    }
    });
    return ++ultimoId
}

io.on('connection', (socket) => {
    console.log('alguien se está conectado...');
    
    io.sockets.emit('listar', productos);
    
    socket.on('notificacion', (titulo, precio, imagen) => {
        const producto = {
          id: getSiguienteId(productos),
          titulo: titulo,
          precio: precio,
          thumbnail: imagen,
        };
        productos.push(producto);

        io.sockets.emit('listar', productos);
    })
    
    io.sockets.emit('mensajes', mensajes);

    socket.on('nuevo', (data)=>{
        mensajes.push(data);
        fs.writeFileSync('./mensaje.txt', JSON.stringify(mensajes));
        io.sockets.emit('mensajes', mensajes)
      })

});

