// Entry point for your plugin
// This should expose your plugin's modules
/* START IMPORTS */
/* END IMPORTS */

/* START EXPORTS */

export const metadata = {
  name: 'bpanel-whitelist',
  pathName: '',
  displayName: 'whitelist',
  author: 'bucko',
  description:
    'A backend plugin for bPanel to whitelist endpoints, so that all non-whitelisted endpoints will be blocked',
  version: require('../package.json').version,
};

/* END EXPORTS */
