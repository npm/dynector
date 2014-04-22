dynector
========

[DynECT DNS](http://dyn.com/managed-dns/) api conveniences


[API docs](https://help.dynect.net/dns-api-knowledge-base/)



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
