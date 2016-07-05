#!/usr/bin/env node

'use strict';

var
	assert = require('assert'),
	chalk  = require('chalk'),
	Dyn    = require('dyn-js'),
	yargs  = require('yargs')
		.usage('add and remove simple host records with Dyn DNS\n$0 [action] fqdn.example.com')
		.example('dynector -a 10.0.0.11 foo.example.com', 'add 10.0.0.11 as an A record for foo.example.com')
		.example('dynector --cname bar.example.com foo.example.com', 'add bar.example.com as CNAME for foo.example.com')
		.example('dynector --delete gone.example.com', 'remove all records for gone.example.com')
		.option('cname',
		{
			alias: 'c',
			describe: 'add a cname to this fqdn'
		})
		.option('arecord',
		{
			alias: 'a',
			describe: 'add an A record to this fqdn'
		})
		.option('delete',
		{
			alias: 'd',
			describe: 'remove this node entirely from Dyn',
			type: 'boolean'
		})
		.option('zone',
		{
			alias: 'z',
			describe: 'the zone to act on; will be deduced from the fqdn if not provided'
		})
		.option('silent',
		{
			describe: 'do not log informationally',
			type: 'boolean'
		})
		.option('replace',
		{
			alias: 'r',
			describe: 'remove, then add the record',
			type: 'boolean'
		})
		.demand(1)
		.help('help')
	;

var argv = {}, dyn;

var logit = function logit(message)
{
	if (!argv || !argv.silent) console.log(message);
};

var addCName = function addCName(dyn, fqdn, cname)
{
	logit('adding cname for ' + chalk.blue(fqdn) + ': ' + chalk.green(cname));
	return dyn.record._CNAME.create(fqdn, { rdata: { cname: cname }});
};

var addARecord = function addARecord(dyn, fqdn, ip)
{
	logit('creating A record for ' + chalk.blue(fqdn) + ': ' + chalk.green(ip));
	return dyn.record._A.create(fqdn, { rdata: { address: ip }});
};

var deleteRecord = function deleteRecord(dyn, fqdn)
{
	logit(chalk.red('*** removing node: ') + chalk.blue(fqdn) + chalk.red(' ***'));
	return dyn.node.destroy(fqdn, { rdata: { zone: fqdn }});
};

var loginAndAct = function loginAndAct(actions)
{
	dyn.session.create()
	.then(function()
	{
		return Promise.all(actions.map(function(action)
		{
			return action();
		}));
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
};

var determineZone = function determineZone(argv)
{
	var PATT = /\.(\w+)\.(\w+)$/;
	var zone = argv.zone;
	if (!zone)
	{
		zone = argv.fqdn;
		var matches = argv.fqdn.match(PATT);
		if (matches)
			zone = matches[1] + '.' + matches[2];
	}

	return zone;
};

if (require.main === module)
{
	argv = yargs.argv;
	argv.fqdn = argv._[0];

	if (!argv.d && !argv.c && !argv.a)
	{
		yargs.showHelp();
		process.exit(1);
	}

	assert(process.env.DYN_CUSTOMER, 'you must set your dyn customer in the DYN_CUSTOMER env var');
	assert(process.env.DYN_USER, 'you must set your dyn username in the DYN_CUSTOMER env var');
	assert(process.env.DYN_PASSWORD, 'you must set your dyn password in the DYN_CUSTOMER env var');

	var zone = determineZone(argv);
	logit('operating on zone ' + zone);
	if (zone === argv.fqdn)
	{
		console.error('zone is same as hostname! declining to let you shoot yourself in the foot.');
		console.error('zone: ' + zone + '; host: ' + argv.fqdn);
		process.exit(1);
	}

	var client = Dyn({
		traffic: {
			customer_name: process.env.DYN_CUSTOMER,
			user_name:     process.env.DYN_USER,
			password:      process.env.DYN_PASSWORD
		}
	});
	dyn = client.traffic.withZone(zone);

	var actions = [];
	if (argv.replace)
		actions.push(function() { return deleteRecord(dyn, argv.fqdn); });
	if (argv.cname)
		actions.push(function() { return addCName(dyn, argv.fqdn, argv.cname); });
	else if (argv.arecord)
		actions.push(function() { return addARecord(dyn, argv.fqdn, argv.arecord); });
	else if (argv.delete)
		actions.push(function() { return deleteRecord(dyn, argv.fqdn); });

	loginAndAct(actions);
}

module.exports =
{
	logit:         logit,
	addCName:      addCName,
	addARecord:    addARecord,
	deleteRecord:  deleteRecord,
	loginAndAct:   loginAndAct,
	determineZone: determineZone,
	argv:          argv,
	dyn:           dyn,
};
