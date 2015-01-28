var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var roomHandler = require('./room-handler');

roomHandler.init(io);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/:roomName', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/:roomName/joinRoom/:userName', function(req, res) {
    roomHandler.joinRoom(req.params.roomName,req.params.userName);
    res.send({ status : 'joined'});
});



/*// usernames which are currently connected to the chat
var usernames = {};

var socketHandler = function(socket) {

    // when the client emits 'message', this listens and executes
    socket.on('message', function(data) {
        // we tell the client to execute 'flood' with 2 parameters
        io.sockets.emit('flood', socket.username, data);
    });

    // when the client emits 'addUser', this listens and executes
    socket.on('addUser', function(username) {
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        // echo to client they've connected
        socket.emit('message', 'SERVER', 'you have connected');
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('flood', 'SERVER', username + ' has connected');
        // update the list of users in chat, client-side
        io.sockets.emit('updateUsers', usernames);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function() {
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateUsers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('flood', 'SERVER', socket.username + ' has disconnected');
    });
};


io.on('connection', socketHandler);*/


http.listen(3000, function() {
    console.log('listening on *:3000');
});