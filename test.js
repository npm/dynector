/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	sinon    = require('sinon'),
	dynector = require('./index')
	;

describe('dynector', function()
{
	var dynMock;

	before(function()
	{
		dynector.argv.silent = true;
		dynMock =
		{
			record:
			{
				_A: { create: sinon.spy() },
				_CNAME: { create: sinon.spy() },
			},
			node: { destroy: sinon.spy() }
		};
	});

	describe('logit', function()
	{
		it('does not call console.log if silent is set', function()
		{
			var spy = sinon.spy(console, 'log');
			dynector.logit('should not see this');
			spy.called.must.be.false();
			spy.restore();
		});

		it('calls console.log if silent is false', function()
		{
			dynector.argv.silent = false;
			var spy = sinon.spy(console, 'log');
			dynector.logit('you should see this');
			spy.calledWith('you should see this').must.be.true();
			spy.restore();
			dynector.argv.silent = true;
		});
	});

	describe('determineZone', function()
	{
		it('returns opts.zone if passed in', function()
		{
			dynector.determineZone({ zone: 'foo' }).must.equal('foo');
		});

		it('returns the last two segments of opts.host', function()
		{
			dynector.determineZone({ fqdn: 'foo.bar.com' }).must.equal('bar.com');
		});

		it('returns opts.host if it has only two segments', function()
		{
			dynector.determineZone({ fqdn: 'foo.bar' }).must.equal('foo.bar');
		});
	});

	describe('addCName', function()
	{
		it('calls _CNAME.create', function()
		{
			var spy = dynMock.record._CNAME.create;
			dynector.addCName(dynMock, 'foo.bar.com', 'two.bar.com');
			spy.called.must.be.true();
			spy.calledWith('foo.bar.com', { rdata: { cname: 'two.bar.com'}}).must.be.true();
		});
	});

	describe('addARecord', function()
	{
		it('calls _A.create', function()
		{
			var spy = dynMock.record._A.create;
			dynector.addARecord(dynMock, 'foo.bar.com', '10.0.0.1');
			spy.called.must.be.true();
			spy.calledWith('foo.bar.com', { rdata: { address: '10.0.0.1'}}).must.be.true();
		});
	});

	describe('deleteRecord', function()
	{
		it('calls node.destroy', function()
		{
			var spy = dynMock.node.destroy;
			dynector.deleteRecord(dynMock, 'foo.bar.com');
			spy.called.must.be.true();
			spy.calledWith('foo.bar.com').must.be.true();
		});
	});

	describe('loginAndAct', function()
	{
		it('has tests');
	});

});
