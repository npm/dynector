dynector
========

[DynECT DNS](http://dyn.com/managed-dns/) api conveniences

Does polling for long-running API calls for you, so you can just continue to write your async node code the way you want to.

[![wercker status](https://app.wercker.com/status/0238326761d5214f6e2315ce1cad4278/m/ "wercker status")](https://app.wercker.com/project/bykey/0238326761d5214f6e2315ce1cad4278)

[API docs](https://help.dynect.net/dns-api-knowledge-base/)


## Usage

```javascript
var Dynector = require('dynector');
var client = new Dynector();

client.on('log', function(msg) { console.log(msg); });

client.login(credentials, function(err, reply)
{
    client.zone('example.com', function(err, reply)
    {
        console.log(reply);
    });
});
```

## Unit tests

To run the tests you must set the following environment variables to your Dynect account credentials:

```
DYN_CUSTOMER
DYN_USER
DYN_PASSWORD
```

I'll mock the API at some point for the bulk of the tests, but the integration tests will probably always need credentials of some kind.

## License

[ISC](http://opensource.org/licenses/ISC)
