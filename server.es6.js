const express = require('express');
const productos = require('./productos.js');
const mensajes = require('./mensajes.js');
const fs = require('fs')

getSiguienteId = ( productos ) => {
    let ultimoId = 0
    productos.forEach(producto => {
    if (producto.id > ultimoId){
        ultimoId = producto.id
    }
    });
    return ++ultimoId
}

const app = express();
const PORT = 8080;
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const server = http.listen(PORT, () => console.log('escuchando puerto 8080'));
server.on('error', error=>console.log('Error en servidor', error));

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