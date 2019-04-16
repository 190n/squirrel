const express = require('express'),
    http = require('http'),
    socketIO = require('socket.io'),
    path = require('path');

const app = express(),
    server = http.Server(app),
    io = socketIO(server);

app.use(express.static(path.join(__dirname, '../client')));

let p1Sock = null,
    p2Sock = null;

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
    });

    if (p1Sock === null) {
        p1Sock = socket;
        socket.emit('init', {
            which: 1,
            isReady: false
        });
    } else if (p2Sock === null) {
        p2Sock = socket;
        socket.emit('init', {
            which: 2,
            isReady: true
        });
        p1Sock.emit('ready');
    }
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});
