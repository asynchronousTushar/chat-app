const express = require('express');
const path = require('path');
const http = require('http');
const sockerio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utilities/message');
const { addUser, removeUser, getuser, getuserroom } = require("./utilities/users");

const publicPath = path.join(__dirname + './../public');
const port = process.env.PORT || 3004;

const app = express();
const server = http.createServer(app);
const io = sockerio(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const user = addUser({ id: socket.id, username, room })

        if (user.error) {
            return callback(user.error);
        }

        socket.join(user.room);

        socket.emit('connected', generateMessage(user.username, "Welcome to chat app!"));
        socket.broadcast.to(user.room).emit('connected', generateMessage(user.username, user.username + " " + 'has joined.'));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getuserroom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (message2, callback) => {
        const user = getuser(socket.id);

        if (user.error) {
            return callback();
        }

        if (!message2) return callback();

        io.to(user.room).emit('connected', generateMessage(user.username, message2));
        callback();
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getuser(socket.id);

        if (user.error) {
            return callback(user.error);
        }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, location))
        callback('successfully');
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('connected', generateMessage(user.username + ' just left!'));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getuserroom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('App started at ', port);
})