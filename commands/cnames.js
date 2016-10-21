var
	create = require('../lib/client'),
	P      = require('bluebird')
	;

function builder(yargs) {}

function handler(argv)
{
	function mapper(item, idx, len)
	{
		// example call:
		// return dyn.record._CNAME.get('foo.example.com', '111989111');
		return dyn.record._CNAME.get(item.fqdn, item.id);
	}

	var dyn = argv.dyn || create(argv);
	return dyn.session.create().then(result =>
	{
		return dyn.record._All.list();
	}).then(result =>
	{
		var records = [];
		result.forEach(item =>
		{
			if (item.type === 'CNAME')
			{
				records.push(item);
			}
		});

		return P.mapSeries(records, mapper);
	}).then(results =>
	{
		results.forEach(item =>
		{
			console.log(`${item.fqdn} ${item.rdata.cname.replace(/\.$/, '')}`);
		});
	})
	.catch(err =>
	{
		console.log(err);
	});
}

module.exports = {
	command: 'cnames <zone>',
	describe: 'list all cnames for the given zone',
	builder: builder,
	handler: handler
};
