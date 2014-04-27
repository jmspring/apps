var async = require('async')
  , nitrogen = require('nitrogen');

function Matcher(session, params) {
    this.session = session;
    this.params = params;
}

Matcher.prototype.matchDevice = function(device, principal, callback) {
    var self = this;

    var permission = new nitrogen.Permission({
        authorized: true,
        issued_to: principal.id,
        principal_for: device.id,
        priority: nitrogen.Permission.NORMAL_PRIORITY
    });

    permission.create(this.session, function(err) {
        if (err) return callback("didn't successfully save permissions.");

        device.claim_code = null;

        device.save(self.session, function(err, savedDevice) {
            if (err) {
                self.session.log.error("matcher: updating claimed principal failed: " + err);
            } else {
                self.session.log.info("matcher: successfully set " + principal.id + " as the admin of " + device.id);
            }

            return callback();
        });
    });
};

Matcher.prototype.matchIfNoAdmin = function(device, principal, callback) {
    var self = this;

    nitrogen.Permission.find(this.session, { principal_for: device.id, issued_to: principal.id }, {}, function(err, permissions) {

        var foundAdmin = false;

        permissions.forEach(function(permission) {
            if (!permission.action || permission.action === "admin") {
                foundAdmin = true;
            }
        });

        if (!foundAdmin) {
            self.session.log.info('matcher: device id: ' + device.id + ' has no admins, giving wildcard rights to principal: ' + principal.id);
            self.matchDevice(device, principal, callback);
        } else {
            self.session.log.info('matcher: device id: ' + device.id + ' already has admin(s): not matching.');
            return callback();
        }
    });
};

Matcher.prototype.matchDevices = function(message, devices, user, callback) {
    var self = this;
    // check to see who changed IP address, was it the device or the user?
    nitrogen.Principal.find(this.session, { _id: message.from }, {}, function(err, fromPrincipals) {
        if (err) return callback("error finding principal: " + err);
        if (fromPrincipals.length === 0) return callback("didn't find principal with id: " + message.from);

        var fromPrincipal = fromPrincipals[0];

        // if the user switched IP address, we match all devices at this IP address.
        // if the device switched IP address, we match that device to this user.
        if (fromPrincipal.is('user')) {
            async.each(devices, function(device, cb) {
                self.matchIfNoAdmin(device, fromPrincipal, cb);
            }, callback);
        } else {
            self.matchIfNoAdmin(fromPrincipal, user, callback);
        }
    });
};

Matcher.prototype.process = function(message) {
    var self = this;

    var yesterday = new Date();
    yesterday.setDate(-1);

    var filter = {
        last_ip: message.body.ip_address,
        last_connection: { $gt: yesterday }
    };

    nitrogen.Principal.find(this.session, filter, {}, function(err, principalsAtIp) {
        if (err) return self.session.log.error('matcher: error looking for principals at this ip address: ' + err);
        var devices = [];
        var users = [];

        principalsAtIp.forEach(function(principal) {
            self.session.log.info("matcher: principal at ip: " + principal.type + ":" + principal.id);

            if (principal.is('user'))
                users.push(principal);
            else if (!principal.is('service'))  // TODO: in a multitier service world we want to support matching of services too.
                devices.push(principal);
        });

        self.session.log.info("matcher: users length: " + users.length + " devices length: " + devices.length);

        if (users.length != 1) return self.session.log.info("matcher: not exactly one user at this ip address. can't match devices.");

        self.matchDevices(message, devices, users[0], function(err) {
            if (err) self.session.log.error(err);
        });
    });
};

Matcher.prototype.start = function() {
    var self = this;
    this.session.onMessage({ type: 'ip' }, function(message) {
        self.process(message);
    });
};

Matcher.prototype.stop = function() {
};

module.exports = Matcher;
