var
    _       = require('lodash'),
    assert  = require('assert'),
    events  = require('events'),
    P       = require('bluebird'),
    Request = require('request'),
    util    = require('util')
    ;


var BASE = 'https://api.dynect.net/REST/';

var Dynector = module.exports = function Dynector(opts)
{
    events.EventEmitter.call(this);

    // anything else?
};
util.inherits(Dynector, events.EventEmitter);

Dynector.prototype.token = null;

Dynector.prototype.headers = function()
{
    var headers =
    {
        'Content-Type': 'application/json'
    };
    if (this.token)
        headers['Auth-Token'] = this.token;

    return headers;
}


// public API: all methods can either take a callback or return a promise

Dynector.prototype.login = function login(credentials, callback)
    { return this._login(credentials).nodeify(callback); };

Dynector.prototype.zones = function zones(callback)
    { return this._zones().nodeify(callback); };
Dynector.prototype.zone = function zone(name, callback)
    { return this._zone(name).nodeify(callback); };
Dynector.prototype.addZone = function addZone(zone, settings, callback)
    { return this._addZone(zone, settings).nodeify(callback); };

Dynector.prototype.nodes = function nodes(zone, callback)
    { return this._nodes(zone).nodeify(callback); };
Dynector.prototype.deleteNode = function deleteNode(zone, fqdn, callback)
    { return this._deleteNode(zone, fqdn).nodeify(callback); };
Dynector.prototype.addARecord = function addARecord(zone, fqdn, address, ttl, callback)
    { return this._nodes(zone, fqdn, address, ttl).nodeify(callback); };
Dynector.prototype.addCNAME = function addCNAME(zone, fqdn, cname, ttl, callback)
    { return this._nodes(zone, fqdn, cname, ttl).nodeify(callback); };

// TODO:
// add node
// get changeset for zone

Dynector.prototype.publish = function publish(zone, callback) { return this._publish(zone).nodeify(callback); };

// run an arbitrary job not otherwise supported in the API
Dynector.prototype.job = function job(options, callback) { return this._job(options).nodeify(callback); };


// promises implementations

Dynector.prototype._login = function _login(credentials)
{
    assert(credentials && _.isObject(credentials), 'you must pass a credentials object to login()');
    assert(credentials.customer_name && _.isString(credentials.customer_name), 'customer_name is required in the login credentials');
    assert(credentials.user_name && _.isString(credentials.user_name), 'user_name is required in the login credentials');
    assert(credentials.password && _.isString(credentials.password), 'password is required in the login credentials');

    var self = this;

    var opts =
    {
        uri    : BASE + 'Session/',
        method : 'POST',
        json   : credentials,
    };

    return self._job(opts)
    .then(function(reply)
    {
        if (reply.status === 'success')
        {
            self.token = reply.data.token;
            self.emit('log', 'logged in');
            return true;
        }

        self.emit('log', 'login failure: ' + reply);
        return false;
    });
};

Dynector.prototype._zones = function _zones()
{
    var self = this;
    var opts = { uri: BASE + 'Zone/', };

    return this._job(opts)
    .then(function(result)
    {
        return _.map(result.data, function(z) { return z.replace(/\/REST\/Zone\//, ''); });
    });
};

Dynector.prototype._zone = function _zone(name)
{
    var opts = { uri: BASE + 'Zone/' + name };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};

Dynector.prototype._addZone = function _addZone(zone, settings)
{
    assert(settings && _.isObject(settings));
    assert(settings.rname);
    assert(settings.ttl);

    var opts =
    {
        uri: BASE + 'Zone/' + zone,
        method: 'POST',
        json:
        {
            rname : settings.rname,
            ttl   : settings.ttl,
            serial_style: settings.serial_style
        },
    };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};


Dynector.prototype._nodes = function _nodes(name)
{
    var opts = { uri: BASE + 'NodeList/' + name };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};


Dynector.prototype._deleteNode = function _deleteNode(zone, fqdn)
{
    var opts =
    {
        uri: BASE + 'Node/' + zone + '/' + fqdn,
        method: 'DELETE',
    };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};


Dynector.prototype._addARecord = function _addARecord(zone, fqdn, address, ttl)
{
    var opts =
    {
        uri: BASE + 'ARecord/' + zone + '/' + fqdn,
        method: 'POST',
        json:
        {
            ttl   : ttl,
            rdata : { address: address },
        },
    };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};


Dynector.prototype._addCNAME = function _addCNAME(zone, fqdn, cname, ttl)
{
    var opts =
    {
        uri: BASE + 'CNAMERecord/' + zone + '/' + fqdn,
        method: 'POST',
        json:
        {
            ttl   : ttl,
            rdata : { cname: cname },
        },
    };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};


Dynector.prototype._publish = function _publish(zone)
{
    var opts =
    {
        uri: BASE + 'Zone/' + zone,
        method: 'PUT',
        json: { publish: true },
    };
    if (opts.uri[opts.uri.length - 1] !== '/')
        opts.uri += '/';

    return this._job(opts)
    .then(function(result)
    {
        return result.data;
    });
};



// promises wrapper for request
Dynector.prototype.execute = function execute(opts)
{
    var self = this,
        deferred = P.defer();

    if (!opts.headers) opts.headers = {};
    _.merge(opts.headers, this.headers());

    Request(opts, function(err, response, body)
    {
        if (err) return deferred.reject(err);
        deferred.resolve(body);
    });

    return deferred.promise;
};

Dynector.prototype._job = function _job(opts)
{
    var self = this,
        deferred = P.defer();

    if (!opts.headers) opts.headers = {};
    _.merge(opts.headers, this.headers());
    if (!_.has(opts, 'json')) opts.json = true;

    var done = false;

    function handleReply(body)
    {
        if (body.status === 'success')
        {
            done = true;
            deferred.resolve(body);
        }
        else if (body.status === 'failure')
        {
            done = true;
            deferred.reject(body);
        }
    }

    function handleError(err)
    {
        done = true;
        deferred.reject(err);
    }

    Request(opts, function(err, response, body)
    {
        if (err) return deferred.reject(err);

        if (response.statusCode === 200)
            return deferred.resolve(body);

        if (response.statusCode !== 307)
            return deferred.reject(new Error('unexpected status: ' + response.statusCode));

        // job is still running & must be polled
        var opts =
        {
            uri    : body,
            method : 'GET',
            json   : true,
        }

        while (!done)
        {
            self.execute(opts).then(handleReply, handleError);
        }
    });

    return deferred.promise;
};
