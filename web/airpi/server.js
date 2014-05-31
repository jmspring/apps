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
    api_key:    config.APP_API_KEY,
    type:       'app',
    nickname:   'airpi-visualization'
});

var messages = {};
var sockets = {};

function updateAllSockets(message) {
    async.each(Object.keys(sockets), function(id, callback) {
        sockets[id].emit('message', message);
        callback();
    });
}

function findLocationMessage(session, principalId) {
    nitrogen.Message.find(session, { type: 'location', from: principalId }, { sort: { ts: -1 }, limit: 1 }, function(err, locations) {
        if (err) return;

        // if we got a location message and didn't in the meantime get one over the subscription.
        if (locations.length > 0 && !messages[principalId]['location']) {
            messages[principalId]['location'] = locations[0];

            updateAllSockets(locations[0]);
        }
    });
}

service.connect(app, function(err, session, app) {
    if (err) return console.log('airpi: connect failed: ' + err);

    session.onMessage({
        $or: [
            { type: 'location' },
            { type: 'temperature' },
            { type: 'pressure' },
            { type: 'humidity' }
        ]
    }, function(message) {

        if (!messages[message.from]) {
            messages[message.from] = {};

            findLocationMessage(session, message.from);
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
