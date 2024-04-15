const testCoverage = require('@open-rpc/test-coverage').default;
const { parseOpenRPCDocument } = require('@open-rpc/schema-utils-js');
const mockServer = require('@open-rpc/mock-server/build/index').default;
const ExamplesRule =
  require('@open-rpc/test-coverage/build/rules/examples-rule').default;
const JsonSchemaFakerRule =
  require('@open-rpc/test-coverage/build/rules/json-schema-faker-rule').default;
const paramsToObj =
  require('@open-rpc/test-coverage/build/utils/params-to-obj').default;
const { v4 } = require('uuid');

const uuid = v4;

const FixtureBuilder = require('../fixture-builder');
const {
  withFixtures,
  openDapp,
  unlockWallet,
  DAPP_URL,
  WINDOW_TITLES,
  switchToOrOpenDapp,
} = require('../helpers');

const { PAGES } = require('../webdriver/driver');

const pollForResult = async (driver, generatedKey) => {
  let result = await driver.executeScript(`return window['${generatedKey}'];`);

  while (result === null) {
    // Continue polling if result is not set
    await driver.delay(50);
    result = await driver.executeScript(`return window['${generatedKey}'];`);
  }

  // clear the result
  await driver.executeScript(`delete window['${generatedKey}'];`);

  return result;
};

const createDriverTransport = (driver) => {
  return async (_, method, params) => {
    const generatedKey = uuid();
    // don't wait for executeScript to finish window.ethereum promise
    // we need this because if we wait for the promise to resolve it
    // will hang in selenium since it can only do one thing at a time.
    // the workaround is to put the response on window.asyncResult and poll for it.
    driver.executeScript(
      ([m, p, g]) => {
        window[g] = null;
        window.ethereum
          .request({ method: m, params: p })
          .then((r) => {
            window[g] = { result: r };
          })
          .catch((e) => {
            window[g] = {
              error: {
                code: e.code,
                message: e.message,
                data: e.data,
              },
            };
          });
      },
      method,
      params,
      generatedKey,
    );
    const response = await pollForResult(driver, generatedKey);
    return response;
  };
};

// this rule makes sure that all confirmation requests are rejected.
// it also validates that the JSON-RPC response is an error with
// error code 4001 (user rejected request)
class ConfirmationsRejectRule {
  constructor(options) {
    this.driver = options.driver;
    this.only = options.only;
    this.rejectButtonInsteadOfCancel = [
      'personal_sign',
      'eth_signTypedData_v4',
    ];
    this.requiresEthAccountsPermission = [
      'personal_sign',
      'eth_signTypedData_v4',
      'eth_getEncryptionPublicKey',
    ];
  }

  getTitle() {
    return 'Confirmations Rejection Rule';
  }

  async beforeRequest(_, call) {
    if (this.requiresEthAccountsPermission.includes(call.methodName)) {
      const requestPermissionsRequest = JSON.stringify({
        jsonrpc: '2.0',
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      await this.driver.executeScript(
        `window.ethereum.request(${requestPermissionsRequest})`,
      );

      await this.driver.waitUntilXWindowHandles(3);
      await this.driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

      await this.driver.findClickableElements({
        text: 'Next',
        tag: 'button',
      });

      await this.driver.clickElement({
        text: 'Next',
        tag: 'button',
      });

      await this.driver.findClickableElements({
        text: 'Connect',
        tag: 'button',
      });

      await this.driver.clickElement({
        text: 'Connect',
        tag: 'button',
      });

      await switchToOrOpenDapp(this.driver);
    }
  }

  async afterRequest(_, call) {
    await this.driver.waitUntilXWindowHandles(3);
    await this.driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

    if (this.rejectButtonInsteadOfCancel.includes(call.methodName)) {
      await this.driver.findClickableElements({
        text: 'Reject',
        tag: 'button',
      });
      await this.driver.clickElement({ text: 'Reject', tag: 'button' });
    } else {
      await this.driver.findClickableElements({
        text: 'Cancel',
        tag: 'button',
      });
      await this.driver.clickElement({ text: 'Cancel', tag: 'button' });
    }
    // make sure to switch back to the dapp or else the next test will fail on the wrong window
    await switchToOrOpenDapp(this.driver);
  }

  // get all the confirmation calls to make and expect to pass
  getCalls(_, method) {
    const calls = [];
    const isMethodAllowed = this.only ? this.only.includes(method.name) : true;
    if (isMethodAllowed) {
      if (method.examples) {
        // pull the first example
        const ex = method.examples[0];
        if (!ex.result) {
          return calls;
        }
        const p = ex.params.map((e) => e.value);
        const params =
          method.paramStructure === 'by-name'
            ? paramsToObj(p, method.params)
            : p;
        calls.push({
          title: `${this.getTitle()} - with example ${ex.name}`,
          methodName: method.name,
          params,
          url: '',
          resultSchema: method.result.schema,
          expectedResult: ex.result.value,
        });
      } else {
        // naively call the method with no params
        calls.push({
          title: `${method.name} > confirmation rejection`,
          methodName: method.name,
          params: [],
          url: '',
          resultSchema: method.result.schema,
        });
      }
    }
    return calls;
  }

  async afterResponse(_, call) {
    if (this.requiresEthAccountsPermission.includes(call.methodName)) {
      const revokePermissionsRequest = JSON.stringify({
        jsonrpc: '2.0',
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });

      await this.driver.executeScript(
        `window.ethereum.request(${revokePermissionsRequest})`,
      );
    }
  }

  validateCall(call) {
    call.valid = call.error.code === 4001;
    return call;
  }
}

async function main() {
  const port = 8545;
  const chainId = 1337;
  await withFixtures(
    {
      dapp: true,
      fixtures: new FixtureBuilder().build(),
      disableGanache: true,
      title: 'api-specs coverage',
    },
    async ({ driver }) => {
      await unlockWallet(driver);

      // Navigate to extension home screen
      await driver.navigate(PAGES.HOME);

      // Open Dapp
      await openDapp(driver, undefined, DAPP_URL);

      const transport = createDriverTransport(driver);

      const openrpcDocument = await parseOpenRPCDocument(
        'https://metamask.github.io/api-specs/latest/openrpc.json',
      );

      const chainIdMethod = openrpcDocument.methods.find(
        (m) => m.name === 'eth_chainId',
      );
      chainIdMethod.examples = [
        {
          name: 'chainIdExample',
          description: 'Example of a chainId request',
          params: [],
          result: {
            name: 'chainIdResult',
            value: `0x${chainId.toString(16)}`,
          },
        },
      ];

      const getBalanceMethod = openrpcDocument.methods.find(
        (m) => m.name === 'eth_getBalance',
      );

      getBalanceMethod.examples = [
        {
          name: 'getBalanceExample',
          description: 'Example of a getBalance request',
          params: [
            {
              name: 'address',
              value: '0x5CfE73b6021E818B776b421B1c4Db2474086a7e1', // can we get this from the wallet?
            },
            {
              name: 'tag',
              value: 'latest',
            },
          ],
          result: {
            name: 'getBalanceResult',
            value: '0x1a8819e0c9bab700', // can we get this from a variable too
          },
        },
      ];

      const blockNumber = openrpcDocument.methods.find(
        (m) => m.name === 'eth_blockNumber',
      );

      blockNumber.examples = [
        {
          name: 'blockNumberExample',
          description: 'Example of a blockNumber request',
          params: [],
          result: {
            name: 'blockNumberResult',
            value: '0x1',
          },
        },
      ];

      const personalSign = openrpcDocument.methods.find(
        (m) => m.name === 'personal_sign',
      );

      personalSign.examples = [
        {
          name: 'personalSignExample',
          description: 'Example of a personalSign request',
          params: [
            {
              name: 'data',
              value: '0xdeadbeef',
            },
            {
              name: 'address',
              value: '0x5CfE73b6021E818B776b421B1c4Db2474086a7e1',
            },
          ],
          result: {
            name: 'personalSignResult',
            value: '0x1a8819e0c9bab700',
          },
        },
      ];

      const switchEthereumChain = openrpcDocument.methods.find(
        (m) => m.name === 'wallet_switchEthereumChain',
      );
      switchEthereumChain.examples = [
        {
          name: 'wallet_switchEthereumChain',
          description:
            'Example of a wallet_switchEthereumChain request to sepolia',
          params: [
            {
              name: 'SwitchEthereumChainParameter',
              value: {
                chainId: '0xaa36a7',
              },
            },
          ],
          result: {
            name: 'wallet_switchEthereumChain',
            value: null,
          },
        },
      ];

      const signTypedData4 = openrpcDocument.methods.find(
        (m) => m.name === 'eth_signTypedData_v4',
      );

      // just update address for signTypedData
      signTypedData4.examples[0].params[0].value =
        '0x5CfE73b6021E818B776b421B1c4Db2474086a7e1';

      // update chainId for signTypedData
      signTypedData4.examples[0].params[1].value.domain.chainId = 1337;

      // add net_version
      openrpcDocument.methods.push({
        name: 'net_version',
        params: [],
        result: {
          description: 'Returns the current network ID.',
          name: 'net_version',
          schema: {
            type: 'string',
          },
        },
        description: 'Returns the current network ID.',
        examples: [
          {
            name: 'net_version',
            description: 'Example of a net_version request',
            params: [],
            result: {
              name: 'net_version',
              value: '0x1',
            },
          },
        ],
      });

      const getEncryptionPublicKey = openrpcDocument.methods.find(
        (m) => m.name === 'eth_getEncryptionPublicKey',
      );

      getEncryptionPublicKey.examples = [
        {
          name: 'getEncryptionPublicKeyExample',
          description: 'Example of a getEncryptionPublicKey request',
          params: [
            {
              name: 'address',
              value: '0x5CfE73b6021E818B776b421B1c4Db2474086a7e1',
            },
          ],
          result: {
            name: 'getEncryptionPublicKeyResult',
            value: '0x1a8819e0c9bab700',
          },
        },
      ];

      const server = mockServer(port, openrpcDocument);
      server.start();

      const methodsWithConfirmations = [
        'wallet_requestPermissions',
        'eth_requestAccounts',
        'wallet_watchAsset',
        'personal_sign', // requires permissions for eth_accounts
        'wallet_addEthereumChain',
        'eth_signTypedData_v4', // requires permissions for eth_accounts
        'wallet_switchEthereumChain',
        // 'eth_getEncryptionPublicKey', // requires permissions for eth_accounts
      ];

      const filteredMethods = openrpcDocument.methods
        .filter(
          (m) =>
            m.name.includes('snap') ||
            m.name.includes('Snap') ||
            m.name.toLowerCase().includes('account') ||
            m.name.includes('crypt') ||
            m.name.includes('blob') ||
            m.name.includes('sendTransaction') ||
            m.name.startsWith('wallet_scanQRCode') ||
            methodsWithConfirmations.includes(m.name),
        )
        .map((m) => m.name);

      await testCoverage({
        openrpcDocument,
        transport,
        reporters: ['console-rule'],
        // only: ['eth_newFilter'],
        rules: [
          new JsonSchemaFakerRule({
            skip: filteredMethods,
            numCalls: 1,
          }),
          new ExamplesRule({
            skip: filteredMethods,
          }),
          new ConfirmationsRejectRule({
            driver,
            only: methodsWithConfirmations,
          }),
        ],
      });
    },
  );
}

main();
