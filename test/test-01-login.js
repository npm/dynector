'use strict';

var
    lab      = require('lab'),
    before   = lab.before,
    after    = lab.after,
    describe = lab.describe,
    it       = lab.it,
    demand   = require('must'),
    Dynector = require('../index')
    ;

describe('Dynector', function()
{
    it('can be constructed', function(done)
    {
        var client = new Dynector();
        client.must.be.an.object();
        client.must.be.instanceof(Dynector);
        done();
    });

    it('login() demands the parameters dynect requires', function(done)
    {
        function shouldThrow()
        {
            var client = new Dynector();
            client.login();
        }

        shouldThrow.must.throw(/credentials object/);
        done();
    });

    it('login() returns a promise if no callback is provided', function(done)
    {
        var client = new Dynector();
        var credentials =
        {
            customer_name: 'hogwarts',
            user_name: 'dumbledore',
            password: 'Sherbet Lemon',
        };

        var result = client.login(credentials);
        result.must.be.an.object();
        result.must.have.property('then');
        result.then.must.be.a.function();
        done();
    });

    it('can log into dynect', function(done)
    {
        var client = new Dynector();

        var credentials =
        {
            customer_name: process.env.DYN_CUSTOMER,
            user_name: process.env.DYN_USER,
            password: process.env.DYN_PASSWORD,
        };

        client.login(credentials)
        .then(function(reply)
        {
            reply.must.be.true();
            done();
        }).done();
    });
});
