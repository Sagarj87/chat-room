var activeRooms = [],
    _ = require('lodash'),
    io = {};

module.exports.init = function(_io) {
    io = _io;
};

var lookUpRooms = function(roomName) {
    return _.findWhere(activeRooms, {
        roomName: roomName
    });
};

module.exports.joinRoom = function(roomName, createdBy) {
    if (!lookUpRooms(roomName)) {
        var nsp = io.of(roomName);

        nsp.on('connection', connectionHandler);

        var room = {
            roomName: roomName,
            createdBy: createdBy,
            createDate: Date.now()
        };

        activeRooms.push(room);
    }
    io.of("/chatroom").emit('newRoom',activeRooms);
};



module.exports.getActiveUsers = function(roomName) {
    var roomInfo = lookUpRooms(roomName);
    return (roomInfo) ? roomInfo.userNames : [];
};


module.exports.getActiveRooms = function() {
    return activeRooms;
};

var connectionHandler = function(socket) {


    // var roomInfo = lookUpRooms(socket.nsp.name.replace('/', ''));
    console.log('someone connected to room', socket.nsp.name);


    var addUserHandler = function(data) {

        var roomInfo = lookUpRooms(data.roomName);
        if (!roomInfo.status) {
            roomInfo.status = 'connected';
            roomInfo.userNames = [];
            roomInfo.conversationHistory = [];
        }


        // echo to client they've connected
        io.of(data.roomName).emit('welcome', data.userName, 'you have connected');

        io.of(data.roomName).emit('resumeChat', data.userName, roomInfo.conversationHistory);

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('flood', 'SERVER', data.userName + ' has connected');
        if (!_.includes(roomInfo.userNames, data.userName)) {
            // add the client's username to the global list
            roomInfo.userNames.push(data.userName);
        }

        // update the list of users in chat, client-side
        io.of(data.roomName).emit('updateUsers', roomInfo.userNames);

    };

    var leaveHandler = function(data) {
        var roomInfo = lookUpRooms(data.roomName);
        if(!roomInfo)  return;
        // remove the username from usernames list
        _.remove(roomInfo.userNames, function(user){
            return user === data.userName;
        });

        if(roomInfo.userNames.length === 0) {
            // discard room if no active users
            discardRoom(roomName);
        }

        // update list of users in chat, client-side
        io.of(roomInfo.roomName).emit('updateUsers', roomInfo.userNames);
        // echo globally that this client has left
        socket.broadcast.emit('flood', 'SERVER', data.userName + ' has disconnected');
    };


    // when the client emits 'addUser', this listens and executes
    socket.on('addUser', addUserHandler);


    // when the client emits 'message', this listens and executes
    socket.on('message', function(data) {
        var roomInfo = lookUpRooms(data.roomName);
        roomInfo.conversationHistory.push({
            userName : data.userName,
            message : data.message,
            timeStamp : Date.now()
        });

        // we tell the client to execute 'flood' with 2 parameters
        io.of(data.roomName).emit('flood', data.userName, data.message);
    });

    socket.on('leave', leaveHandler);

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        var roomName = socket.nsp.name.replace('/', '');
        var roomInfo = lookUpRooms(roomName);

        if(!roomInfo)  return;
       
        if(roomInfo.userNames.length < 2) {
            // discard room if no active users
            discardRoom(roomName);
        }

        // update list of users in chat, client-side
        io.of(roomInfo.roomName).emit('updateUsers', roomInfo.userNames);
     
        console.log('someone disconnected from room', roomName);
    });


    socket.on('typing', function(userName){
        socket.broadcast.emit('typing', userName);
    });

};

var discardRoom = function(roomName){
    var beforeCount = activeRooms.length;
    _.remove(activeRooms, function(room){
        return room.roomName === roomName;
    });
    var flag = beforeCount > activeRooms.length || activeRooms.length === 0;
    if(flag) io.of("/chatroom").emit('newRoom',activeRooms);
    return flag;
};