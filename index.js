#!/usr/bin/env node

var
	_       = require('lodash'),
	assert  = require('assert'),
	dyn  = require('dyn-js'),
	yargs = require('yargs')
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
		.help('help')
;

var argv = yargs.argv;

if (!argv.d && !argv.c && !argv.a)
{
	yargs.showHelp();
	process.exit(1);
}
