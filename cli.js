#!/usr/bin/env node

var updater = require('update-notifier'),
	pkg     = require('./package.json');

updater({pkg: pkg}).notify();

var yargs = require('yargs')
	.usage('dynector: conveniences for interacting with the dynect API')
	.option('zone',
	{
		alias: 'z',
		description: 'specify a zone',
	})
	.option('replace',
	{
		alias: 'r',
		describe: 'remove the node before acting',
		type: 'boolean'
	})
	.option('silent',
	{
		describe: 'do not log informationally',
		type: 'boolean'
	})
	.example('dynector arecord example.com 10.0.0.1')
	.example('dynector cname www.example.com example.com')
	.example('dynector cname oops.example.com example.com')
	.example('dynector delete oops.example.com')
	.example('dynector list example.com')
	.example('dynector resolve example.com')
	.version()
	.help()
	;

yargs.command(require('./commands/arecord.js'));
yargs.command(require('./commands/cname.js'));
yargs.command(require('./commands/delete.js'));
yargs.command(require('./commands/list.js'));
yargs.command(require('./commands/resolve.js'));

yargs.argv;
