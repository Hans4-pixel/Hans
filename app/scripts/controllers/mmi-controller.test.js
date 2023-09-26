/* eslint-disable */
import { KeyringController } from '@metamask/keyring-controller';
import { MmiConfigurationController } from '@metamask-institutional/custody-keyring';
import { TransactionUpdateController } from '@metamask-institutional/transaction-update';
import { SignatureController } from '@metamask/signature-controller';

import MMIController from './mmi-controller';
import TransactionController from './transactions';
import PreferencesController from './preferences';
import AppStateController from './app-state';

describe('MMIController', function () {
  let mmiController;

  beforeEach(function () {
    const mockMessenger = {
      call: jest.fn(() => ({
        catch: jest.fn(),
      })),
      registerActionHandler: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
    };

    mmiController = new MMIController({
      mmiConfigurationController: new MmiConfigurationController(),
      keyringController: new KeyringController({
        messenger: mockMessenger,
        initState: {},
      }),
      transactionUpdateController: new TransactionUpdateController({
        getCustodyKeyring: jest.fn(),
      }),
      txController: new TransactionController({
        initState: {},
        provider: {
          chainId: 'fail',
          nickname: '',
          rpcTarget: 'https://api.myetherwallet.com/eth',
          ticker: 'ETH',
          type: 'rinkeby',
        },
        getCurrentChainId: jest.fn(),
        getNetworkId: jest.fn(),
        onNetworkStateChange: jest.fn(),
      }),
      signatureController: new SignatureController({
        messenger: mockMessenger,
        keyringController: new KeyringController({
          initState: {},
          messenger: mockMessenger,
        }),
        isEthSignEnabled: jest.fn(),
        getAllState: jest.fn(),
        securityProviderRequest: jest.fn(),
        getCurrentChainId: jest.fn(),
      }),
      preferencesController: new PreferencesController({
        initState: {},
        onAccountRemoved: jest.fn(),
        provider: {},
        networkConfigurations: {},
      }),
      appStateController: new AppStateController({
        addUnlockListener: jest.fn(),
        isUnlocked: jest.fn(() => true),
        initState: {},
        onInactiveTimeout: jest.fn(),
        showUnlockRequest: jest.fn(),
        preferencesStore: {
          subscribe: jest.fn(),
          getState: jest.fn(() => ({
            preferences: {
              autoLockTimeLimit: 0,
            },
          })),
        },
        messenger: mockMessenger,
      }),
      custodianEventHandlerFactory: jest.fn(),
    });
  });

  describe('mmiController constructor', function () {
    it('should instantiate correctly', function () {
      expect(mmiController).toBeInstanceOf(MMIController);
    });

    it('should have all required properties', function () {
      expect(mmiController.opts).toBeDefined();
      expect(mmiController.mmiConfigurationController).toBeDefined();
      expect(mmiController.preferencesController).toBeDefined();
      expect(mmiController.transactionUpdateController).toBeDefined();
    });
  });

  describe('persistKeyringsAfterRefreshTokenChange', function () {
    it('should call keyringController.persistAllKeyrings', async function () {
      mmiController.keyringController.persistAllKeyrings = jest.fn();

      await mmiController.persistKeyringsAfterRefreshTokenChange();

      expect(
        mmiController.keyringController.persistAllKeyrings,
      ).toHaveBeenCalled();
    });
  });

  describe('trackTransactionEventFromCustodianEvent', function () {
    it('should call txController._trackTransactionMetricsEvent', function () {
      const txMeta = {};
      const event = 'event';
      mmiController.txController._trackTransactionMetricsEvent = jest.fn();

      mmiController.trackTransactionEventFromCustodianEvent(txMeta, event);

      expect(
        mmiController.txController._trackTransactionMetricsEvent,
      ).toHaveBeenCalledWith(txMeta, event);
    });
  });

  describe('custodianEventHandlerFactory', function () {
    it('should call custodianEventHandlerFactory', async function () {
      mmiController.custodianEventHandlerFactory = jest.fn();

      mmiController.custodianEventHandlerFactory();

      expect(mmiController.custodianEventHandlerFactory).toHaveBeenCalled();
    });
  });

  describe('storeCustodianSupportedChains', function () {
    it('should call storeCustodianSupportedChains', async function () {
      mmiController.storeCustodianSupportedChains = jest.fn();

      mmiController.storeCustodianSupportedChains('0x1');

      expect(mmiController.storeCustodianSupportedChains).toHaveBeenCalledWith(
        '0x1',
      );
    });
  });
});
