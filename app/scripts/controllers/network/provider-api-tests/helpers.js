import nock from 'nock';
import sinon from 'sinon';
import { JsonRpcEngine } from 'json-rpc-engine';
import { providerFromEngine } from 'eth-json-rpc-middleware';
import EthQuery from 'eth-query';
import createInfuraClient from '../createInfuraClient';
import createJsonRpcClient from '../createJsonRpcClient';

/**
 * @typedef {import('nock').Scope} NockScope
 *
 * A object returned by the `nock` function for mocking requests to a particular
 * base URL.
 */

/**
 * @typedef {{blockTracker: import('eth-block-tracker').PollingBlockTracker, clock: sinon.SinonFakeTimers, makeRpcCall: (request: Partial<JsonRpcRequest>) => Promise<any>, makeRpcCallsInSeries: (requests: Partial<JsonRpcRequest>[]) => Promise<any>}} Client
 *
 * Provides methods to interact with the suite of middleware that
 * `createInfuraClient` or `createJsonRpcClient` exposes.
 */

/**
 * @typedef {{providerType: "infura" | "custom", infuraNetwork?: string, customRpcUrl?: string, customChainId?: string}} WithClientOptions
 *
 * The options bag that `withClient` takes.
 */

/**
 * @typedef {(client: Client) => Promise<any>} WithClientCallback
 *
 * The callback that `withClient` takes.
 */

/**
 * @typedef {[WithClientOptions, WithClientCallback] | [WithClientCallback]} WithClientArgs
 *
 * The arguments to `withClient`.
 */

/**
 * @typedef {{ nockScope: NockScope, blockNumber: string }} MockBlockTrackerRequestOptions
 *
 * The options to `mockNextBlockTrackerRequest` and `mockAllBlockTrackerRequests`.
 */

/**
 * @typedef {{ nockScope: NockScope, request: object, response: object, delay?: number }} MockRpcCallOptions
 *
 * The options to `mockRpcCall`.
 */

/**
 * @typedef {{mockNextBlockTrackerRequest: (options: Omit<MockBlockTrackerRequestOptions, 'nockScope'>) => void, mockAllBlockTrackerRequests: (options: Omit<MockBlockTrackerRequestOptions, 'nockScope'>) => void, mockRpcCall: (options: Omit<MockRpcCallOptions, 'nockScope'>) => NockScope}} Communications
 *
 * Provides methods to mock different kinds of requests to the provider.
 */

/**
 * @typedef {{providerType: 'infura' | 'custom', infuraNetwork?: string}} WithMockedCommunicationsOptions
 *
 * The options bag that `Communications` takes.
 */

/**
 * @typedef {(comms: Communications) => Promise<any>} WithMockedCommunicationsCallback
 *
 * The callback that `mockingCommunications` takes.
 */

/**
 * @typedef {[WithMockedCommunicationsOptions, WithMockedCommunicationsCallback] | [WithMockedCommunicationsCallback]} WithMockedCommunicationsArgs
 *
 * The arguments to `mockingCommunications`.
 */

/**
 * A dummy value for the `infuraProjectId` option that `createInfuraClient`
 * needs. (Infura should not be hit during tests, but just in case, this should
 * not refer to a real project ID.)
 */
const MOCK_INFURA_PROJECT_ID = 'abc123';

/**
 * A dummy value for the `rpcUrl` option that `createJsonRpcClient` needs. (This
 * should not be hit during tests, but just in case, this should also not refer
 * to a real Infura URL.)
 */
const MOCK_RPC_URL = 'http://foo.com';

/**
 * A default value for the `eth_blockNumber` request that the block tracker
 * makes.
 */
const DEFAULT_LATEST_BLOCK_NUMBER = '0x42';

/**
 * If you're having trouble writing a test and you're wondering why the test
 * keeps failing, you can set `process.env.DEBUG_PROVIDER_TESTS` to `1`. This
 * will turn on some extra logging.
 *
 * @param {any[]} args - The arguments that `console.log` takes.
 */
function debug(...args) {
  if (process.env.DEBUG_PROVIDER_TESTS === '1') {
    console.log(...args);
  }
}

/**
 * Builds a Nock scope object for mocking provider requests.
 *
 * @param {object} args - The arguments.
 * @param {string} args.providerType - The type of provider to use (either
 * "infura" or "custom").
 * @param {string} [args.infuraNetwork] - When `providerType` is "infura",
 * the Infura network that will be interpolated into the Infura RPC URL
 * (default: "mainnet").
 * @param {string} [args.customRpcUrl] - When `providerType` is "custom",
 * the URL of the RPC endpoint.
 * @returns {NockScope} The nock scope.
 */
function buildScopeForMockingRequests({
  providerType,
  infuraNetwork = 'mainnet',
  customRpcUrl = MOCK_RPC_URL,
}) {
  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  const rpcUrl =
    providerType === 'infura'
      ? `https://${infuraNetwork}.infura.io`
      : customRpcUrl;

  return nock(rpcUrl).filteringRequestBody((body) => {
    const copyOfBody = JSON.parse(body);
    // some ids are random, so remove them entirely from the request to
    // make it possible to mock these requests
    delete copyOfBody.id;
    return JSON.stringify(copyOfBody);
  });
}

/**
 * Mocks the next request for the latest block that the block tracker will make.
 *
 * @param {MockBlockTrackerRequestOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {string} args.blockNumber - The block number that the block tracker
 * should report, as a 0x-prefixed hex string.
 */
async function mockNextBlockTrackerRequest({
  nockScope,
  blockNumber = DEFAULT_LATEST_BLOCK_NUMBER,
}) {
  await mockRpcCall({
    nockScope,
    request: { method: 'eth_blockNumber', params: [] },
    response: { result: blockNumber },
  });
}

/**
 * Mocks all requests for the latest block that the block tracker will make.
 *
 * @param {MockBlockTrackerRequestOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {string} args.blockNumber - The block number that the block tracker
 * should report, as a 0x-prefixed hex string.
 */
async function mockAllBlockTrackerRequests({
  nockScope,
  blockNumber = DEFAULT_LATEST_BLOCK_NUMBER,
}) {
  await mockRpcCall({
    nockScope,
    request: { method: 'eth_blockNumber', params: [] },
    response: { result: blockNumber },
  }).persist();
}

/**
 * Mocks a JSON-RPC request sent to the provider with the given response.
 * Provider type is inferred from the base url set on the nockScope.
 *
 * @param {MockRpcCallOptions} args - The arguments.
 * @param {NockScope} args.nockScope - A nock scope (a set of mocked requests
 * scoped to a certain base URL).
 * @param {object} args.request - The request data.
 * @param {{body: string} | {httpStatus?: number; id?: number; method?: string; params?: string[]}} [args.response] - Information
 * concerning the response that the request should have. If a `body` property is
 * present, this is taken as the complete response body. If an `httpStatus`
 * property is present, then it is taken as the HTTP status code to respond
 * with. Properties other than these two are used to build a complete response
 * body (including `id` and `jsonrpc` properties).
 * @param {Error | string} [args.error] - An error to throw while making the
 * request. Takes precedence over `response`.
 * @param {number} [args.delay] - The amount of time that should pass before the
 * request resolves with the response.
 * @param {number} [args.times] - The number of times that the request is
 * expected to be made.
 * @returns {NockScope} The nock scope.
 */
function mockRpcCall({ nockScope, request, response, error, delay, times }) {
  // eth-query always passes `params`, so even if we don't supply this property,
  // for consistency with makeRpcCall, assume that the `body` contains it
  const { method, params = [], ...rest } = request;
  const httpStatus = response?.httpStatus ?? 200;
  let completeResponse;
  if (response !== undefined) {
    if (response.body === undefined) {
      completeResponse = { id: 1, jsonrpc: '2.0' };
      ['id', 'jsonrpc', 'result', 'error'].forEach((prop) => {
        if (response[prop] !== undefined) {
          completeResponse[prop] = response[prop];
        }
      });
    } else {
      completeResponse = response.body;
    }
  }
  const url = nockScope.basePath.includes('infura.io')
    ? `/v3/${MOCK_INFURA_PROJECT_ID}`
    : '/';
  let nockRequest = nockScope.post(url, {
    jsonrpc: '2.0',
    method,
    params,
    ...rest,
  });

  if (delay !== undefined) {
    nockRequest = nockRequest.delay(delay);
  }

  if (times !== undefined) {
    nockRequest = nockRequest.times(times);
  }

  if (error !== undefined) {
    return nockRequest.replyWithError(error);
  } else if (completeResponse !== undefined) {
    return nockRequest.reply(httpStatus, completeResponse);
  }
  return nockRequest;
}

/**
 * Makes a JSON-RPC call through the given eth-query object.
 *
 * @param {any} ethQuery - The eth-query object.
 * @param {object} request - The request data.
 * @returns {Promise<any>} A promise that either resolves with the result from
 * the JSON-RPC response if it is successful or rejects with the error from the
 * JSON-RPC response otherwise.
 */
function makeRpcCall(ethQuery, request) {
  return new Promise((resolve, reject) => {
    debug('[makeRpcCall] making request', request);
    ethQuery.sendAsync(request, (error, result) => {
      debug('[makeRpcCall > ethQuery handler] error', error, 'result', result);
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Sets up request mocks for requests to the provider.
 *
 * @param {WithMockedCommunicationsArgs} args - Either an options bag + a
 * function, or just a function. The options bag must contain `providerType`
 * (either "infura" or "custom"); if `providerType` is "infura" then it may
 * contain `infuraNetwork` (defaults to "mainnet"), and if the `providerType` is
 * "custom" then it may contain `customRpcUrl`. The function is called with an
 * object that allows you to mock different kinds of requests.
 * @returns {Promise<any>} The return value of the given function.
 */
export async function withMockedCommunications(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const {
    providerType,
    infuraNetwork = 'mainnet',
    customRpcUrl = MOCK_RPC_URL,
  } = options;

  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  const nockScope = buildScopeForMockingRequests({
    providerType,
    infuraNetwork,
    customRpcUrl,
  });
  const curriedMockNextBlockTrackerRequest = (localOptions) =>
    mockNextBlockTrackerRequest({ nockScope, ...localOptions });
  const curriedMockAllBlockTrackerRequests = (localOptions) =>
    mockAllBlockTrackerRequests({ nockScope, ...localOptions });
  const curriedMockRpcCall = (localOptions) =>
    mockRpcCall({ nockScope, ...localOptions });
  const comms = {
    mockNextBlockTrackerRequest: curriedMockNextBlockTrackerRequest,
    mockAllBlockTrackerRequests: curriedMockAllBlockTrackerRequests,
    mockRpcCall: curriedMockRpcCall,
  };

  try {
    return await fn(comms);
  } finally {
    nock.isDone();
    nock.cleanAll();
  }
}

/**
 * Builds a provider from the middleware (for the provider type) along with a
 * block tracker, runs the given function with those two things, and then
 * ensures the block tracker is stopped at the end.
 *
 * @param {WithClientArgs} args - Either an options bag + a function, or just a
 * function. The options bag must contain `providerType` (either "infura" or
 * "custom"); if `providerType` is "infura" then it may contain `infuraNetwork`
 * (defaults to "mainnet"), and if the `providerType` is "custom" then it may
 * contain `customRpcUrl` and/or `customChainId` (defaults to "0x1").
 * The function is called with an object that allows
 * you to interact with the client via a couple of methods on that object.
 * @returns {Promise<any>} The return value of the given function.
 */
export async function withClient(...args) {
  const [options, fn] = args.length === 2 ? args : [{}, args[0]];
  const {
    providerType,
    infuraNetwork = 'mainnet',
    customRpcUrl = MOCK_RPC_URL,
    customChainId = '0x1',
  } = options;

  if (providerType !== 'infura' && providerType !== 'custom') {
    throw new Error(
      `providerType must be either "infura" or "custom", was "${providerType}" instead`,
    );
  }

  // The JSON-RPC client wraps `eth_estimateGas` so that it takes 2 seconds longer
  // than it usually would to complete. Or at least it should — this doesn't
  // appear to be working correctly. Unset `IN_TEST` on `process.env` to prevent
  // this behavior.
  const inTest = process.env.IN_TEST;
  delete process.env.IN_TEST;
  const clientUnderTest =
    providerType === 'infura'
      ? createInfuraClient({
          network: infuraNetwork,
          projectId: MOCK_INFURA_PROJECT_ID,
        })
      : createJsonRpcClient({ rpcUrl: customRpcUrl, chainId: customChainId });
  process.env.IN_TEST = inTest;

  const { networkMiddleware, blockTracker } = clientUnderTest;

  const engine = new JsonRpcEngine();
  engine.push(networkMiddleware);
  const provider = providerFromEngine(engine);
  const ethQuery = new EthQuery(provider);

  const curriedMakeRpcCall = (request) => makeRpcCall(ethQuery, request);
  const makeRpcCallsInSeries = async (requests) => {
    const responses = [];
    for (const request of requests) {
      responses.push(await curriedMakeRpcCall(request));
    }
    return responses;
  };
  // Faking timers ends up doing two things:
  // 1. Halting the block tracker (which depends on `setTimeout` to periodically
  // request the latest block) set up in `eth-json-rpc-middleware`
  // 2. Halting the retry logic in `@metamask/eth-json-rpc-infura` (which also
  // depends on `setTimeout`)
  const clock = sinon.useFakeTimers();
  const client = {
    blockTracker,
    clock,
    makeRpcCall: curriedMakeRpcCall,
    makeRpcCallsInSeries,
  };

  try {
    return await fn(client);
  } finally {
    await blockTracker.destroy();

    clock.restore();
  }
}

/**
 * Some JSON-RPC endpoints take a "block" param (example: `eth_blockNumber`)
 * which can optionally be left out. Additionally, the endpoint may support some
 * number of arguments, although the "block" param will always be last, even if
 * it is optional. Given this, this function builds a mock `params` array for
 * such an endpoint, filling it with arbitrary values, but with the "block"
 * param missing.
 *
 * @param {number} index - The index within the `params` array where the "block"
 * param *would* appear.
 * @returns {string[]} The mock params.
 */
export function buildMockParamsWithoutBlockParamAt(index) {
  const params = [];
  for (let i = 0; i < index; i++) {
    params.push('some value');
  }
  return params;
}

/**
 * Some JSON-RPC endpoints take a "block" param (example: `eth_blockNumber`)
 * which can optionally be left out. Additionally, the endpoint may support some
 * number of arguments, although the "block" param will always be last, even if
 * it is optional. Given this, this function builds a `params` array for such an
 * endpoint with the given "block" param added at the end.
 *
 * @param {number} index - The index within the `params` array to add the
 * "block" param.
 * @param {any} blockParam - The desired "block" param to add.
 * @returns {any[]} The mock params.
 */
export function buildMockParamsWithBlockParamAt(index, blockParam) {
  const params = buildMockParamsWithoutBlockParamAt(index);
  params.push(blockParam);
  return params;
}

/**
 * Returns a partial JSON-RPC request object, with the "block" param replaced
 * with the given value.
 *
 * @param {object} request - The request object.
 * @param {string} request.method - The request method.
 * @param {params} [request.params] - The request params.
 * @param {number} blockParamIndex - The index within the `params` array of the
 * block param.
 * @param {any} blockParam - The desired block param value.
 * @returns {object} The updated request object.
 */
export function buildRequestWithReplacedBlockParam(
  { method, params = [] },
  blockParamIndex,
  blockParam,
) {
  const updatedParams = params.slice();
  updatedParams[blockParamIndex] = blockParam;
  return { method, params: updatedParams };
}
