'use strict';

const handlers = require('./handlers');

/**
 * @module faucet-server
 */

exports.beforeCoreMiddleware = [
  {
    method: 'USE',
    path: '/clients/:id',
    handler: handlers.checkWhitelisted,
  },
];
