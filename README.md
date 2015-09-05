# dynector

A command-line client for adding & removing single nodes to your DynECT zone.

[![on npm](http://img.shields.io/npm/v/dynector.svg?style=flat)](https://www.npmjs.org/package/dynector)  [![Tests](http://img.shields.io/travis/npm/dynector.svg?style=flat)](http://travis-ci.org/npm/dynector)  [![Dependencies](http://img.shields.io/david/npm/dynector.svg?style=flat)](https://david-dm.org/npm/dynector)

## Usage

To run the tool you must set the following environment variables to your DynECT account credentials:

```
DYN_CUSTOMER
DYN_USER
DYN_PASSWORD
```

`dynector -a 10.0.0.11 foo.example.com`: add the A record `10.0.0.11` to foo.example.com

`dynector --cname bar.example.com foo.example.com`: add the CNAME record `bar.example.com` to foo.example.com

`dynector --delete gone.example.com`: remove all records for gone.example.com

Options:

```
add and remove simple host records with Dyn DNS
index.js [action] fqdn.example.com

Options:
  --cname, -c    add a cname to this fqdn
  --arecord, -a  add an A record to this fqdn
  --delete, -d   remove this node entirely from Dyn
  --zone, -z     the Dyn zone to act on; will be deduced from the fqdn if not provided
  --silent       do not log informationally                            [boolean]
  --help         Show help                                             [boolean]
```

## License

[ISC](http://opensource.org/licenses/ISC)
