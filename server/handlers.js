function isMatch(src, regexpOrString) {
  if (regexpOrString instanceof RegExp)
    return Boolean(src.match(regexpOrString));
  else if (typeof regexpOrString === 'string')
    return Boolean(src.match(RegExp(regexpOrString)));
  throw new TypeError(
    `Expected either a string or RegExp, instead received ${typeof regexpOrString}`
  );
}

/*
 * check if given req is white listed
 * @param { Bcfg } - config - config object containing optional whitelist param
 * @param { req } - req - passed from router to compare if the
 * route is whitelisted or not
 * @returns { Boolean } - true if req is whitelisted otherwise false
 */
function isWhitelisted(config, req) {
  const whitelist = config.array('whitelist', []);
  const { path, method, body } = req;

  // make sure the main path is still whitelisted
  whitelist.push({ method: 'ALL', path: '^/$' });

  // loop through each whitelist to check if allowed
  for (let whitelisted of whitelist) {
    // if item in array is just a string, check against the path
    // must be an exact match
    if (
      (typeof whitelisted === 'string' || whitelisted instanceof RegExp) &&
      isMatch(path, whitelisted)
    )
      return true;
    // for objects, will check path and method match
    else if (
      (whitelisted.method === method || whitelisted.method === 'ALL') &&
      isMatch(path, whitelisted.path)
    ) {
      // if method is POST and whitelist config indicates a body
      // we also want to check the request body for matches
      // if body contains any match from whitelist config, then return true
      if ((method === 'POST' || method == 'ALL') && whitelisted.body) {
        // get list of props in the body
        const props = Object.keys(body);
        for (let prop of props) {
          // if whitelist config has the body prop
          // compare value in config and req
          // only do comparison if the _config_ indicates a body
          // so this check will be skipped if req has
          // body property that is not indicated in the config
          if (
            whitelisted.body[prop] &&
            !isMatch(body[prop], whitelisted.body[prop])
          )
            // return false if whitelist config has same prop as req body
            // but the values don't match
            return false;
        }
      }
      // if not POST and no `body` check, or above req.body check passes
      // then can return true
      return true;
    }
  }
  // if no match, confirm not whitelisted
  return false;
}

// if req is not whitelisted then return forbidden endpoint
function checkWhitelisted(req, res, next) {
  const { config, logger } = req;
  const whitelist = config.array('whitelist', []);

  // if no whitelist in config then it is automatically disabled
  // i.e. all paths are open
  const whitelistingEnabled = whitelist.length
    ? config.bool('whitelist-enabled', true)
    : false;

  // if whitelisting is enabled, check if request has been whitelisted
  if (!isWhitelisted(config, req) && whitelistingEnabled) {
    logger.debug(
      'Request, %s %s, is not whitelisted and was blocked',
      req.method,
      req.path
    );
    if (req.body) logger.debug('body in request:', req.body);
    return res.status(403).json({ error: { message: 'Forbidden', code: 403 } });
  }
  next();
}

module.exports = {
  checkWhitelisted,
  isWhitelisted,
};
