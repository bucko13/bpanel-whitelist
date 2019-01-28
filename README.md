# bPanel Whitelist

This plugin utilizes bPanel's backend plugin system to enable whitelisting
for backend endpoints. This adds additional security for your bPanel server
ontop of the available by default blacklisting.

If whitelisting is enabled, then any endpoints that don't match the criteria
will be blocked with a `403` response sent back to any client that made the request.

## Installation

With bpanel-cli:

```shell
$ bpanel-cli i bpanel-whitelist
```

## Usage

Once enabled, you can add whitelisted endpoints the same way
as blacklisting, via the [bcfg](https://github.com/bcoin-org/bcfg) interface.

The `whitelist` configuration supports an array of strings, of regular expressions
or of objects with `method`, `path`, and optionally `body` parameters.
For strings and regular expressions, these can be set at runtime via the cli, otherwise
the whitelist can be set in your bpanel's `config.js`.

NOTE: The whitelist only applies to requests made to a node via the `clients` endpoints.

EXAMPLE:
This will only allow calls to your node for the wallets, getting node info,
and rpc calls to get peer info and get blocks (e.g. for recent blocks and
and the peers widget). This will, for example, block a request to stop your node.
```javascript
module.exports = {
  plugins: ['bpanel-whitelist'],
  whitelist: [
    {
      method: 'ALL',
      path: 'wallet',
    },
    {
      method: 'GET',
      path: 'node',
    },
    {
      method: 'POST',
      path: 'node',
      body: {
        method: /getpeer\w+|(getblock)\w+/,
      },
    },
  ],
};
```

### `whitelist-enabled`
There is an optional config to enable/disable the whitelist. It will automatically
be disabled if there is no `whitelist` config. If this is set to `false`, then
all non-blacklisted endpoints will be re-enabled.

## Debug mode
If you are having problem with another plugin and want to see if a particular endpoint
needs to be whitelisted, you can set `log-level` to `debug` mode. This will log out
any requests that are being blocked so that you can add them to your whitelist if
desired.

