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

var data = {};
var sockets = {};

service.connect(app, function(err, session, app) {
    session.onMessage({
        $or: [
            { type: 'temperature' },
            { type: 'humidity' }
        ]
    }, function(message) {
        if (!data[message.from])
            data[message.from] = {};

        data[message.from][message.type] = message;

        async.each(Object.keys(sockets), function(id, callback) {
            sockets[id].emit(message);
        });
    });

    config.buildAuthorizeUri(app.id);
});

io.sockets.on('connection', function(socket) {
    socket.id = shortid.generate();
    sockets[socket.id] = socket;

    socket.on('disconnect', function() {
        delete sockets[socket.id];
    });

    socket.on('start', function() {
        Object.keys(data).forEach(function(deviceId) {
            Object.keys(data[deviceId]).forEach(function(typeKey) {
                socket.emit('data', data[deviceId][typeKey]);
            });
        });
    });
});

webapp.get('/', function(req, res) {
    res.render('map/index', {
        airpi_authorization_uri: config.airpi_authorization_uri
    });
});

webapp.engine('handlebars', hbs.engine);
webapp.set('view engine', 'handlebars');

webapp.use(express.static(path.join(__dirname, '/static')));

server.listen(config.port);