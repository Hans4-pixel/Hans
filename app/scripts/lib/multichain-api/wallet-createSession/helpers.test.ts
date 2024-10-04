import { RpcEndpointType } from '@metamask/network-controller';
import * as EthereumChainUtils from '../../rpc-method-middleware/handlers/ethereum-chain-utils';
import { validateAndAddEip3085 } from './helpers';

jest.mock('../../rpc-method-middleware/handlers/ethereum-chain-utils', () => ({
  validateAddEthereumChainParams: jest.fn(),
}));
const MockEthereumChainUtils = jest.mocked(EthereumChainUtils);

describe('wallet_createSession helpers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateAndAddEip3085', () => {
    const addNetwork = jest.fn();
    const findNetworkClientIdByChainId = jest.fn();

    beforeEach(() => {
      findNetworkClientIdByChainId.mockImplementation(() => {
        throw new Error('cannot find network client for chainId');
      });

      MockEthereumChainUtils.validateAddEthereumChainParams.mockReturnValue({
        chainId: '0x5',
        chainName: 'test',
        firstValidBlockExplorerUrl: 'http://explorer.test.com',
        firstValidRPCUrl: 'http://rpc.test.com',
        ticker: 'TST',
      });
    });

    it('validates the eip3085 params', async () => {
      try {
        await validateAndAddEip3085({
          eip3085Params: { foo: 'bar' },
          addNetwork,
          findNetworkClientIdByChainId,
        });
      } catch (err) {
        // noop
      }
      expect(
        MockEthereumChainUtils.validateAddEthereumChainParams,
      ).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('checks if the chainId can already be served', async () => {
      try {
        await validateAndAddEip3085({
          eip3085Params: { foo: 'bar' },
          addNetwork,
          findNetworkClientIdByChainId,
        });
      } catch (err) {
        // noop
      }
      expect(findNetworkClientIdByChainId).toHaveBeenCalledWith('0x5');
    });

    it('returns undefined if a network client already exists for the chainId', async () => {
      findNetworkClientIdByChainId.mockReturnValue('existingNetworkClientId');
      const result = await validateAndAddEip3085({
        eip3085Params: {},
        addNetwork,
        findNetworkClientIdByChainId,
      });

      expect(addNetwork).not.toHaveBeenCalled();
      expect(result).toStrictEqual(undefined);
    });

    it('adds a new network returns the chainId if a network client does not already exist for the chainId', async () => {
      addNetwork.mockResolvedValue({ chainId: '0x5' });
      const result = await validateAndAddEip3085({
        eip3085Params: {},
        addNetwork,
        findNetworkClientIdByChainId,
      });

      expect(addNetwork).toHaveBeenCalledWith({
        blockExplorerUrls: ['http://explorer.test.com'],
        defaultBlockExplorerUrlIndex: 0,
        chainId: '0x5',
        defaultRpcEndpointIndex: 0,
        name: 'test',
        nativeCurrency: 'TST',
        rpcEndpoints: [
          {
            url: 'http://rpc.test.com',
            name: 'test',
            type: RpcEndpointType.Custom,
          },
        ],
      });
      expect(result).toStrictEqual('0x5');
    });
  });
});
