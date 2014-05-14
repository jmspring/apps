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

function updateAllSockets(message) {
    async.each(Object.keys(sockets), function(id, callback) {
        sockets[id].emit('message', message);
        callback();
    });
}

service.connect(app, function(err, session, app) {
    session.onMessage({
        $or: [
            { type: 'temperature' },
            { type: 'humidity' }
        ]
    }, function(message) {
        if (!messages[message.from]) {

            var location = new nitrogen.Message({
                from: message.from,
                type: 'location',
                body: {
                    latitude: 51.5072 + 0.5 * Math.random(),
                    longitude: -0.1275 + 0.5 * Math.random()
                }
            });

            messages[message.from] = {
                location: location
            };

            updateAllSockets(location);
        }

        messages[message.from][message.type] = message;
        updateAllSockets(message);
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