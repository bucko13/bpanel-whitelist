const { isWhitelisted } = require('../server/handlers');
const Config = require('bcfg');
const assert = require('bsert');

describe('endpoint handlers', () => {
  describe('isWhitelisted', () => {
    let config;
    beforeEach(() => {
      config = new Config('test');
      const options = {
        whitelist: [
          RegExp(/whiteli/),
          'whitelisted/path',
          {
            method: 'GET',
            path: '/test/path',
          },
          {
            method: 'ALL',
            path: '/test/path/all',
          },
          {
            method: 'POST',
            path: '/node/post',
            body: {
              method: RegExp(/peer/),
            },
          },
        ],
      };
      config.inject(options);
    });

    it('should check for string and regex matches with path', () => {
      const testReq = {
        method: 'GET',
        path: '/whitelisted/path',
      };
      const testReq2 = {
        method: 'GET',
        path: '/test/path',
      };
      const failedReq = {
        method: 'GET',
        path: '/path/is/blacklisted',
      };

      assert(
        isWhitelisted(config, testReq),
        `Expected ${testReq.path} to be whitelisted`
      );
      assert(
        isWhitelisted(config, testReq2),
        `Expected ${testReq2.path} to be whitelisted`
      );
      assert(
        !isWhitelisted(config, failedReq),
        `Expected path "${failedReq.path}" not to match`
      );
    });

    it('should check method and path properties for list of objects', () => {
      const req = {
        method: 'GET',
        path: '/test/path',
      };
      const reqFail = {
        method: 'PUT',
        path: '/test/path',
      };

      assert(isWhitelisted(config, req), 'Expected req to be whitelisted');
      assert(
        !isWhitelisted(config, reqFail),
        'Should fail with method mismatch'
      );
    });

    it('should support ALL value for methods', () => {
      const postReq = {
        method: 'POST',
        path: '/test/path/all',
      };
      const getReq = {
        method: 'get',
        path: '/test/path/all',
      };
      const putReq = {
        method: 'put',
        path: '/test/path/all',
      };
      const deleteReq = {
        method: 'DELETE',
        path: '/test/path/all',
      };

      const requests = [postReq, getReq, putReq, deleteReq];

      requests.forEach(req =>
        assert(
          isWhitelisted(config, req),
          `Expected method ${req.method} to be whitelisted for path ${req.path}`
        )
      );
    });

    it('should check the body properties for POST requests w/ matching path', () => {
      const rpcReq = {
        method: 'POST',
        path: '/node/post',
        body: {
          method: 'getpeerinfo',
        },
      };
      const rpcMismatch = {
        method: 'POST',
        path: '/node/post',
        body: {
          method: 'kill',
        },
      };
      assert(
        isWhitelisted(config, rpcReq),
        `Expected ${rpcReq.body.method} request to be whitelisted`
      );
      assert(
        !isWhitelisted(config, rpcMismatch),
        `Expected ${rpcMismatch.body.method} request to not be whitelisted`
      );
    });
  });
});
