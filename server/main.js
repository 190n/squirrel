const express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),
    path = require('path');

const app = express(),
    server = http.Server(app),
    io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', socket => {
    console.log('new connection');
    socket.on('state', s => {
        socket.broadcast.emit('state', s);
    });

    socket.on('update', u => {
        socket.broadcast.emit('update', u);
    });

    socket.on('newBullet', b => {
        socket.broadcast.emit('newBullet', b);
    })
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});
