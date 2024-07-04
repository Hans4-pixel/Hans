import nock from 'nock';
import { CHAIN_IDS } from '../../../shared/constants/network';
import { BRIDGE_API_BASE_URL } from '../../../shared/constants/bridge';
import BridgeController, { BridgeUserAction } from './bridge';

const EMPTY_INIT_STATE = {
  bridgeState: {
    bridgeFeatureFlags: {
      extensionSupport: false,
      srcNetworkAllowlist: [],
      destNetworkAllowlist: [],
    },
    destTokens: {},
  },
};

describe('BridgeController', function () {
  let bridgeController: BridgeController;

  beforeAll(function () {
    bridgeController = new BridgeController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    nock(BRIDGE_API_BASE_URL)
      .get('/getAllFeatureFlags')
      .reply(200, {
        'extension-support': true,
        'src-network-allowlist': [10, 534352],
        'dest-network-allowlist': [137, 42161],
      });
    nock(BRIDGE_API_BASE_URL)
      .get('/getTokens?chainId=10')
      .reply(200, [
        {
          address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          symbol: 'ABC',
          decimals: 16,
        },
        {
          address: '0x1291478912',
          symbol: 'DEF',
          decimals: 16,
        },
      ]);
  });

  it('constructor should setup correctly', function () {
    expect(bridgeController.store.getState()).toStrictEqual(EMPTY_INIT_STATE);
  });

  it('setBridgeFeatureFlags should fetch and set the bridge feature flags', async function () {
    const featureFlagsResponse = {
      extensionSupport: true,
      destNetworkAllowlist: [CHAIN_IDS.POLYGON, CHAIN_IDS.ARBITRUM],
      srcNetworkAllowlist: [CHAIN_IDS.OPTIMISM, CHAIN_IDS.SCROLL],
    };
    expect(bridgeController.store.getState()).toStrictEqual(EMPTY_INIT_STATE);

    await bridgeController.setBridgeFeatureFlags();
    expect(
      bridgeController.store.getState().bridgeState.bridgeFeatureFlags,
    ).toStrictEqual(featureFlagsResponse);
  });

  it('selectDestNetwork should set the bridge dest tokens', async function () {
    await bridgeController[BridgeUserAction.SELECT_DEST_NETWORK]('0xa');
    expect(
      bridgeController.store.getState().bridgeState.destTokens,
    ).toStrictEqual({
      '0x0000000000000000000000000000000000000000': {
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        iconUrl: './images/eth_logo.svg',
        name: 'Ether',
        symbol: 'ETH',
      },
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
        address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        symbol: 'ABC',
        decimals: 16,
      },
    });
  });
});
