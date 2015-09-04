#!/usr/bin/env node

var
	_      = require('lodash'),
	assert = require('assert'),
	chalk  = require('chalk'),
	Dyn    = require('dyn-js'),
	yargs  = require('yargs')
		.usage('add and remove simple host records to DNS\n$0 --host foo.example.com -a 10.0.0.11')
		.option('host',
		{
			alias: 'h',
			describe: 'the hostname you wish to operate on',
			demand: true
		})
		.option('cname',
		{
			alias: 'c',
			describe: 'add a cname for this host'
		})
		.option('arecord',
		{
			alias: 'a',
			describe: 'add an A record for this host'
		})
		.option('delete',
		{
			alias: 'd',
			describe: 'remove this node entirely from DNS'
		})
		.option('zone',
		{
			alias: 'z',
			describe: 'the zone to act on; will be deduced from the hostname if not provided'
		})
		.option('silent',
		{
			describe: 'do not log informationally',
			type: 'boolean'
		})
		.help('help')
;

var argv = yargs.argv;

if (!argv.d && !argv.c && !argv.a)
{
	yargs.showHelp();
	process.exit(1);
}

assert(process.env.DYN_CUSTOMER, 'you must set your dyn customer in the DYN_CUSTOMER env var');
assert(process.env.DYN_USER, 'you must set your dyn username in the DYN_CUSTOMER env var');
assert(process.env.DYN_PASSWORD, 'you must set your dyn password in the DYN_CUSTOMER env var');

var logit = function logit(message)
{
	if (!argv.silent) console.log(message);
};

var addCName = function addCName(dyn, host, cname)
{
	logit('adding cname for ' + chalk.blue(host) + ': ' + chalk.green(cname));
	return dyn.record._CNAME.create(host, { rdata: { cname: cname }});
};

var addARecord = function addARecord(dyn, host, ip)
{
	logit('creating A record for ' + chalk.blue(host) + ': ' + chalk.green(ip));
	return dyn.record._A.create(host, { rdata: { address: ip }});
};

var deleteRecord = function deleteRecord(dyn, host)
{
	logit(chalk.red('*** removing node: ') + chalk.blue(host) + chalk.red(' ***'));
	return dyn.node.destroy(host, { rdata: { zone: host }});
};

var PATT = /\.(\w+)\.(\w+)$/;
var zone = argv.zone;
if (!zone)
{
	zone = argv.host;
	var matches = argv.host.match(PATT);
	if (matches)
		zone = matches[1] + '.' + matches[2];
}

logit('operating on zone ' + zone);
if (zone === argv.host)
{
	console.error('zone is same as hostname! declining to let you shoot yourself in the foot.');
	console.error('zone: ' + zone + '; host: ' + argv.host);
	process.exit(1);
}

var client = Dyn({traffic:{
	customer_name: process.env.DYN_CUSTOMER,
	user_name:     process.env.DYN_USER,
	password:      process.env.DYN_PASSWORD
}});
var dyn = client.traffic.withZone(zone);

function loginAndAct(action)
{
	dyn.session.create()
	.then(function(r)
	{
		return action();
	})
	.then(function(result)
	{
		return dyn.zone.publish();

	}).then(function(result)
	{
		return dyn.session.destroy();
	}).then(function(result)
	{
		logit(chalk.green('Done!'));
	}).catch(function(err)
	{
		console.log(chalk.red(err));
	}).done();
}

var action;
if (argv.cname)
	action = function() { return addCName(dyn, argv.host, argv.cname); };
else if (argv.arecord)
	action = function() { return addARecord(dyn, argv.host, argv.arecord); };
else if (argv.delete)
	action = function() { return deleteRecord(dyn, argv.host); };

loginAndAct(action);

module.exports =
{
	logit:        logit,
	addCName:     addCName,
	addARecord:   addARecord,
	deleteRecord: deleteRecord
};
