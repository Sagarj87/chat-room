var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var roomHandler = require('./src/room-handler');
var path = require('path');

roomHandler.init(io);


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/indexA.html');
});

app.get('/join/:roomName', function(req, res) {
    res.sendFile(__dirname + '/public/indexA.html');
})

app.post('/:roomName/joinRoom/:userName', function(req, res) {
    roomHandler.joinRoom(req.params.roomName,req.params.userName);
    res.send({ status : 'joined'});
});

app.get('/chatroom', function(req, res) {
    res.sendFile(__dirname + '/public/chatRoom.html');
});

app.get('/:roomName/users', function(req, res) {
    res.send(roomHandler.getActiveUsers(req.params.roomName));
});

app.get('/rooms/fetch', function(req, res) {
    res.send(roomHandler.getActiveRooms());
});


// Showing stack errors
app.set('showStackError', true);


var pub = __dirname + '/public';

// setup middleware
app.use(express.static(pub));

// Optional since express defaults to CWD/views
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/public'));

// Set our default template engine to "jade"
// which prevents the need for extensions
// (although you can still mix and match)
app.set('view engine', 'jade');


// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
app.use(function(err, req, res, next) {
    // If the error object doesn't exists
    if (!err) return next();

    // Log it
    console.error(err.stack);

    // Error page
    res.status(500).render('500', {
        error: err.stack
    });
});

// Assume 404 since no middleware responded
app.use(function(req, res) {
    res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not Found'
    });
});

http.listen(80, function() {
    console.log('listening on *:80');
});