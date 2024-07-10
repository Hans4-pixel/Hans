import { EthereumRpcError } from 'eth-rpc-errors';
import { assertScopeSupported, assertScopesSupported } from './assert';
import { ScopeObject } from './scope';
import * as Supported from './supported';

jest.mock('./supported', () => ({
  isSupportedScopeString: jest.fn(),
  isSupportedNotification: jest.fn(),
  isSupportedAccount: jest.fn(),
}));
const MockSupported = jest.mocked(Supported);

const validScopeObject: ScopeObject = {
  methods: [],
  notifications: [],
};

describe('Scope Assert', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('assertScopeSupported', () => {
    const findNetworkClientIdByChainId = jest.fn();
    const getInternalAccounts = jest.fn();

    describe('scopeString', () => {
      it('checks if the scopeString is supported', () => {
        try {
          assertScopeSupported('scopeString', validScopeObject, {
            findNetworkClientIdByChainId,
            getInternalAccounts,
          });
        } catch (err) {
          // noop
        }
        expect(MockSupported.isSupportedScopeString).toHaveBeenCalledWith(
          'scopeString',
          findNetworkClientIdByChainId,
        );
      });

      it('throws an error if the scopeString is not supported', () => {
        MockSupported.isSupportedScopeString.mockReturnValue(false);
        expect(() => {
          assertScopeSupported('scopeString', validScopeObject, {
            findNetworkClientIdByChainId,
            getInternalAccounts,
          });
        }).toThrow(
          new EthereumRpcError(5100, 'Requested chains are not supported'),
        );
      });
    });

    describe('scopeObject', () => {
      beforeEach(() => {
        MockSupported.isSupportedScopeString.mockReturnValue(true);
      });

      it('throws an error if there are methods missing from the OpenRPC Document', () => {
        expect(() => {
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              methods: ['missing method'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          );
        }).toThrow(
          new EthereumRpcError(5101, 'Requested methods are not supported'),
        );
      });

      it('checks if the notifications are supported', () => {
        try {
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              notifications: ['chainChanged'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          );
        } catch (err) {
          // noop
        }

        expect(MockSupported.isSupportedNotification).toHaveBeenCalledWith(
          'chainChanged',
        );
      });

      it('throws an error if there are unsupported notifications', () => {
        MockSupported.isSupportedNotification.mockReturnValue(false);
        expect(() => {
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              notifications: ['chainChanged'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          );
        }).toThrow(
          new EthereumRpcError(
            5102,
            'Requested notifications are not supported',
          ),
        );
      });

      it('checks if the accounts are supported', () => {
        try {
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              accounts: ['eip155:1:0xdeadbeef'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          );
        } catch (err) {
          // noop
        }

        expect(MockSupported.isSupportedAccount).toHaveBeenCalledWith(
          'eip155:1:0xdeadbeef',
          getInternalAccounts,
        );
      });

      it('throws an error if there are unsupported accounts', () => {
        MockSupported.isSupportedAccount.mockReturnValue(false);
        expect(() => {
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              accounts: ['eip155:1:0xdeadbeef'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          );
        }).toThrow(
          new EthereumRpcError(5103, 'Requested accounts are not supported'),
        );
      });

      it('does not throw if the scopeObject is valid', () => {
        MockSupported.isSupportedNotification.mockReturnValue(true);
        MockSupported.isSupportedAccount.mockReturnValue(true);
        expect(
          assertScopeSupported(
            'scopeString',
            {
              ...validScopeObject,
              methods: ['eth_chainId'],
              notifications: ['chainChanged'],
              accounts: ['eip155:1:0xdeadbeef'],
            },
            {
              findNetworkClientIdByChainId,
              getInternalAccounts,
            },
          ),
        ).toBeUndefined();
      });
    });
  });

  describe('assertScopesSupported', () => {
    const findNetworkClientIdByChainId = jest.fn();
    const getInternalAccounts = jest.fn();

    it('throws an error if no scopes are defined', () => {
      expect(() => {
        assertScopesSupported(
          {},
          {
            findNetworkClientIdByChainId,
            getInternalAccounts,
          },
        );
      }).toThrow(new EthereumRpcError(5100, 'Unknown error with request'));
    });

    it('throws an error if any scope is invalid', () => {
      MockSupported.isSupportedScopeString.mockReturnValue(false);

      expect(() => {
        assertScopesSupported(
          {
            scopeString: validScopeObject,
          },
          {
            findNetworkClientIdByChainId,
            getInternalAccounts,
          },
        );
      }).toThrow(
        new EthereumRpcError(5100, 'Requested chains are not supported'),
      );
    });

    it('does not throw an error if all scopes are valid', () => {
      MockSupported.isSupportedScopeString.mockReturnValue(true);

      expect(
        assertScopesSupported(
          {
            scopeStringA: validScopeObject,
            scopeStringB: validScopeObject,
          },
          {
            findNetworkClientIdByChainId,
            getInternalAccounts,
          },
        ),
      ).toBeUndefined();
    });
  });
});
