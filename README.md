# dynector

A command-line client for adding & removing single nodes to your DynECT host.

## Usage

```
add and remove simple host records to DNS
dynector --host foo.example.com -a 10.0.0.11

Options:
  --host, -h   the hostname you wish to operate on                    [required]
  --cname, -c  add a cname for this host
  -a           add an A record for this host
  --help       Show help                                               [boolean]
```

To run the tool you must set the following environment variables to your DynECT account credentials:

```
DYN_CUSTOMER
DYN_USER
DYN_PASSWORD
```



## License

[ISC](http://opensource.org/licenses/ISC)
