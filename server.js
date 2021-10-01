'use strict';

var express = require('express');
var productos = require('./productos.js');
var mensajes = require('./mensajes.js');
var fs = require('fs');

getSiguienteId = function getSiguienteId(productos) {
    var ultimoId = 0;
    productos.forEach(function (producto) {
        if (producto.id > ultimoId) {
            ultimoId = producto.id;
        }
    });
    return ++ultimoId;
};

var app = express();
var PORT = 8080;
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var server = http.listen(PORT, function () {
    return console.log('escuchando puerto 8080');
});
server.on('error', function (error) {
    return console.log('Error en servidor', error);
});

io.on('connection', function (socket) {
    console.log('alguien se está conectado...');

    io.sockets.emit('listar', productos);

    socket.on('notificacion', function (titulo, precio, imagen) {
        var producto = {
            id: getSiguienteId(productos),
            titulo: titulo,
            precio: precio,
            thumbnail: imagen
        };
        productos.push(producto);

        io.sockets.emit('listar', productos);
    });

    io.sockets.emit('mensajes', mensajes);

    socket.on('nuevo', function (data) {
        mensajes.push(data);
        fs.writeFileSync('./mensaje.txt', JSON.stringify(mensajes));
        io.sockets.emit('mensajes', mensajes);
    });
});
