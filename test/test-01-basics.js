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
    var credentials =
    {
        customer_name: process.env.DYN_CUSTOMER,
        user_name: process.env.DYN_USER,
        password: process.env.DYN_PASSWORD,
    };

    it('can be constructed', function(done)
    {
        var client = new Dynector();
        client.must.be.an.object();
        client.must.be.instanceof(Dynector);
        done();
    });

    describe('login', function()
    {
        it('login() demands an options object', function(done)
        {
            function shouldThrow()
            {
                var client = new Dynector();
                client.login();
            }

            shouldThrow.must.throw(/credentials object/);
            done();
        });

        it('login() demands the parameters dynect requires', function(done)
        {
            function shouldThrow1()
            {
                var client = new Dynector();
                client.login({});
            }

            function shouldThrow2()
            {
                var client = new Dynector();
                client.login({ customer_name: 'foo' });
            }

            function shouldThrow3()
            {
                var client = new Dynector();
                client.login({ customer_name: 'foo', user_name: 'bar' });
            }

            shouldThrow1.must.throw(/customer_name/);
            shouldThrow2.must.throw(/user_name/);
            shouldThrow3.must.throw(/password/);

            done();
        });


        it('login() returns a promise if no callback is provided', function(done)
        {
            var client = new Dynector();
            var result = client.login(credentials);
            result.must.be.an.object();
            result.must.have.property('then');
            result.then.must.be.a.function();
            done();
        });

        it('can log into dynect', { timeout: 5000 }, function(done)
        {
            var client = new Dynector();
            client.login(credentials, function(err, reply)
            {
                demand(err).not.exist();
                reply.must.be.true();
                done();
            });
        });
    });

    describe('zones', function()
    {
        var client, testzone;

        before(function(done)
        {
            client = new Dynector();
            client.login(credentials).then(done).done();
        });

        it('can fetch all zones', function(done)
        {
            client.zones()
            .then(function(z)
            {
                z.must.be.truthy();
                z.must.be.an.array();
                z.length.must.be.above(0);

                testzone = z[z.length - 1];

                done();
            }).done();
        });

        it('can fetch all details about a zone', function(done)
        {
            client.zone(testzone)
            .then(function(result)
            {
                result.must.be.an.object();
                result.must.have.property('zone_type');
                result.must.have.property('serial_style');
                result.must.have.property('serial');
                result.must.have.property('zone');

                result.zone.must.equal(testzone.replace(/\/$/, ''));

                done();
            }).done();
        });

        it('can add a zone');
        it('can add a CNAME record to a zone');
        it('can add a A record to a zone');

        it('can fetch the nodelist for a zone', function(done)
        {
            client.nodes(testzone)
            .then(function(result)
            {
                result.must.be.an.array();
                result.length.must.be.above(0);
                result[0].must.be.a.string();

                done();
            }).done();
        });

        it('can remove a zone');

        it('can review a pending changeset');
        it('can publish a pending changeset');

    });
});
