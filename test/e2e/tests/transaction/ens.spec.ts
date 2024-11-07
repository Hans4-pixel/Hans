import { Suite } from 'mocha';
import { MockttpServer } from 'mockttp';
import { defaultGanacheOptions, withFixtures } from '../../helpers';
import { Driver } from '../../webdriver/driver';
import FixtureBuilder from '../../fixture-builder';
import { loginWithoutBalanceValidation } from '../../page-objects/flows/login.flow';
import HomePage from '../../page-objects/pages/homepage';
import SendTokenPage from '../../page-objects/pages/send/send-token-page';
import { mockServerJsonRpc } from '../ppom/mocks/mock-server-json-rpc';

describe('ENS', function (this: Suite) {
  const sampleAddress: string = '1111111111111111111111111111111111111111';

  // Having 2 versions of the address is a bug(#25286)
  const shortSampleAddress = '0x1111...1111';
  const shortSampleAddresV2 = '0x11111...11111';
  const chainId = 1;
  const mockResolver = '226159d592e2b063810a10ebf6dcbada94ed68b8';

  const sampleEnsDomain: string = 'test.eth';
  const infuraUrl: string =
    'https://mainnet.infura.io/v3/00000000000000000000000000000000';
  const infuraLineaMainnetUrl: string =
    'https://linea-mainnet.infura.io/v3/00000000000000000000000000000000';
  const infuraLineaSepoliaUrl: string =
    'https://linea-sepolia.infura.io/v3/00000000000000000000000000000000';
  const infuraSepoliaUrl: string =
    'https://sepolia.infura.io/v3/00000000000000000000000000000000';

  async function mockInfura(mockServer: MockttpServer): Promise<void> {
    await mockServer
      .forPost(infuraUrl)
      .withJsonBodyIncluding({ method: 'eth_blockNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: '0x1',
        },
      }));
    await mockServer
      .forPost(infuraLineaMainnetUrl)
      .withJsonBodyIncluding({ method: 'eth_blockNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '43',
          result: '0x1',
        },
      }));
    await mockServer
      .forPost(infuraLineaSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_blockNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '43',
          result: '0x1',
        },
      }));
    await mockServer
      .forPost(infuraSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_blockNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '43',
          result: '0x29',
        },
      }));
    await mockServer
      .forPost(infuraUrl)
      .withJsonBodyIncluding({ method: 'eth_getBalance' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: '0x1',
        },
      }));
    await mockServer
      .forPost(infuraSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_getBalance' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '6183194981233610',
        },
      }));
    await mockServer
      .forPost(infuraLineaMainnetUrl)
      .withJsonBodyIncluding({ method: 'eth_getBalance' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '6183194981233610',
        },
      }));
    await mockServer
      .forPost(infuraLineaSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_getBalance' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '6183194981233610',
        },
      }));

    await mockServer
      .forPost(infuraUrl)
      .withJsonBodyIncluding({ method: 'eth_getBlockByNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: {},
        },
      }));
    await mockServer
      .forPost(infuraLineaMainnetUrl)
      .withJsonBodyIncluding({ method: 'eth_getBlockByNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: {},
        },
      }));

    await mockServer
      .forPost(infuraLineaSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_getBlockByNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: {},
        },
      }));
    await mockServer
      .forPost(infuraSepoliaUrl)
      .withJsonBodyIncluding({ method: 'eth_getBlockByNumber' })
      .thenCallback(() => ({
        statusCode: 200,
        json: {
          jsonrpc: '2.0',
          id: '1111111111111111',
          result: {},
        },
      }));
    await mockServerJsonRpc(mockServer, [
      ['eth_chainId', { result: `0x${chainId}` }],
      [
        'eth_call',
        {
          params: [
            {
              to: '0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e',
              data: '0x0178b8bfeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1',
            },
          ],
          result: `0x000000000000000000000000${mockResolver}`,
        },
      ],
      [
        'eth_call',
        {
          params: [
            {
              to: `0x${mockResolver}`,
              data: '0x01ffc9a79061b92300000000000000000000000000000000000000000000000000000000',
            },
          ],
          result: `0x0000000000000000000000000000000000000000000000000000000000000000`,
        },
      ],
      [
        'eth_call',
        {
          params: [
            {
              to: `0x${mockResolver}`,
              data: '0x3b3b57deeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1',
            },
          ],
          result: `0x000000000000000000000000${sampleAddress}`,
        },
      ],
      [
        'eth_call',
        {
          params: [
            {
              to: '0xf62e6a41561b3650a69bb03199c735e3e3328c0d',
              data: '0xf0002ea90000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000005cfe73b6021e818b776b421b1c4db2474086a7e100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
            },
          ],
          result: `0x`,
        },
      ],
    ]);
  }

  it('domain resolves to a correct address', async function () {
    await withFixtures(
      {
        fixtures: new FixtureBuilder().withNetworkControllerOnMainnet().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test?.fullTitle(),
        testSpecificMock: mockInfura,
      },
      async ({ driver }: { driver: Driver }) => {
        await loginWithoutBalanceValidation(driver);
        await driver.delay(10000 * 50);

        // click send button on homepage to start send flow
        const homepage = new HomePage(driver);
        await homepage.check_pageIsLoaded();
        await homepage.check_expectedBalanceIsDisplayed('<0.000001');
        await homepage.startSendFlow();

        // fill ens address as recipient when user lands on send token screen
        const sendToPage = new SendTokenPage(driver);
        await sendToPage.check_pageIsLoaded();
        await sendToPage.fillRecipient(sampleEnsDomain);

        // verify that ens domain resolves to the correct address
        await sendToPage.check_ensAddressResolution(
          sampleEnsDomain,
          shortSampleAddress,
        );

        // Verify the resolved ENS address can be used as the recipient address
        await sendToPage.check_ensAddressAsRecipient(
          sampleEnsDomain,
          shortSampleAddresV2,
        );
      },
    );
  });
});
