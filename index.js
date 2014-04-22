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

};
util.inherits(Dynector, events.EventEmitter);

Dynector.prototype.token = null;

Dynector.prototype.headers = function headers()
{
    var headers = {};
    if (this.token)
        headers['Auth-Token'] = this.token;

    return headers;
}


// public API: all methods can either take a callback or return a promise

Dynector.prototype.login = function(credentials, callback)
{
    return this._login(credentials).nodeify(callback);
};


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

    return self.execute(opts)
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
}
