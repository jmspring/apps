var async = require('async')
  , config = require('./config')
  , express = require('express')
  , webapp = express()
  , server = require('http').createServer(webapp)
  , io = require('socket.io').listen(server)
  , exphbs = require('express3-handlebars')
  , hbs = exphbs.create({ defaultLayout: 'main' })
  , nitrogen = require('nitrogen')
  , path = require('path')
  , shortid = require('shortid');

var service = new nitrogen.Service(config);

var app = new nitrogen.Principal({
    api_key: config.API_KEY,
    type: 'app',
    nickname: 'airpi-visualization'
});

var messages = {};
var sockets = {};

service.connect(app, function(err, session, app) {
    session.onMessage({
        $or: [
            { type: 'temperature' },
            { type: 'humidity' }
        ]
    }, function(message) {
        if (!messages[message.from])
            messages[message.from] = {};

        messages[message.from][message.type] = message;

        async.each(Object.keys(sockets), function(id, callback) {
            console.log('emitting message on socket: ' + id);
            sockets[id].emit('message', message);
            callback();
        });
    });

    config.buildAuthorizeUri(app.id);
});

server.listen(config.port);

io.sockets.on('connection', function(socket) {
    socket.n2id = shortid.generate();
    sockets[socket.n2id] = socket;

    socket.on('disconnect', function() {
        delete sockets[socket.n2id];
    });

    socket.on('start', function() {
        console.log('got start');
        Object.keys(messages).forEach(function(deviceId) {
            Object.keys(messages[deviceId]).forEach(function(typeKey) {
                socket.emit('message', messages[deviceId][typeKey]);
            });
        });
    });
});

webapp.get('/index.html', function(req, res) {
    res.render('map/index', {
        airpi_authorization_uri: config.airpi_authorization_uri
    });
});

webapp.engine('handlebars', hbs.engine);
webapp.set('view engine', 'handlebars');

webapp.use(express.static(path.join(__dirname, '/static')));
