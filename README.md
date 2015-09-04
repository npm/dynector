# dynector

A command-line client for adding & removing single nodes to your DynECT zone.

## Usage

```
add and remove simple host records with the DynECT api
dynector --host foo.example.com -a 10.0.0.11

Options:
  --host, -h     the fqdn you wish to operate on                  [required]
  --cname, -c    add a cname for this fqdn
  --arecord, -a  add an A record for this fqdn
  --delete, -d   remove this node entirely from Dyn
  --zone, -z     the zone to act on; will be deduced from the hostname if not
                 provided
  --silent       do not log informationally                            [boolean]
  --help         Show help                                             [boolean]
```

To run the tool you must set the following environment variables to your DynECT account credentials:

```
DYN_CUSTOMER
DYN_USER
DYN_PASSWORD
```

## License

[ISC](http://opensource.org/licenses/ISC)
