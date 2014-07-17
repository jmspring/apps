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
    type:       'app',
    nickname:   'mosaic'
});

var images = {};
var cameras = {};
var sockets = {};

function sendImage(session, image) {
    if (!image) return;

    image.body.url = image.body.url + "?access_token=" + encodeURIComponent(session.accessToken.token);

    images[image.from] = image;

    async.each(Object.keys(sockets), function(id, callback) {
        console.log('sending image: ' + JSON.stringify(image));
        sockets[id].emit('image', image);
        callback();
    });
}

function sendCamera(camera) {
    if (!camera) return;

    cameras[camera.id] = camera;

    async.each(Object.keys(sockets), function(id, callback) {
        console.log('sending camera: ' + JSON.stringify(camera));
        sockets[id].emit('camera', camera);
        callback();
    });
}

function findCameras(session) {
    nitrogen.Principal.find(session, { tags: 'sends:image' }, {}, function(err, principals) {
        if (err) return console.log('principal request failed: ' + err);

        principals.forEach(function(camera) {
           if (!cameras[camera.id]) {
               nitrogen.Message.find(session, { type: 'image' }, { limit: 1, sort: { ts: -1 } }, function(err, messages) {
                   if (err) return session.log.error('message request failed: ' + err);

                   if (messages.length) {
                       session.log.info('last image for camera: ' + JSON.stringify(messages));
                       sendImage(session, messages[0]);
                   }
               });

               sendCamera(camera);
           }
        });
    });
}

service.connect(app, function(err, session, app) {
    if (err) return console.log('airpi: connect failed: ' + err);

    findCameras(session);

    session.onMessage({ type: 'image' }, function(image) {
        sendImage(session, image);
    });

    config.buildAuthorizationUri();

    webapp.get('/', function(req, res) {
        if (req.query.post_authorize)
            findCameras(session);

        res.render('mosaic/index', {
            app_authorization_uri: config.app_authorization_uri
        });
    });

    server.listen(config.port);

    webapp.engine('handlebars', hbs.engine);
    webapp.set('view engine', 'handlebars');

    webapp.use(express.static(path.join(__dirname, '/static')));

    // on failure we just drop everything and restart via forever.
    // TODO: this is a pretty heavy hammer: session failures should be restarted transparently.
    session.onFailure(function() {
        process.exit(0);
    });
});

io.sockets.on('connection', function(socket) {
    socket.n2id = shortid.generate();
    sockets[socket.n2id] = socket;

    socket.on('disconnect', function() {
        delete sockets[socket.n2id];
    });

    socket.on('start', function() {
        Object.keys(cameras).forEach(function(cameraId) {
             socket.emit('camera', cameras[cameraId]);
        });

        Object.keys(images).forEach(function(cameraId) {
             socket.emit('image', images[cameraId]);
        });
    });
});
