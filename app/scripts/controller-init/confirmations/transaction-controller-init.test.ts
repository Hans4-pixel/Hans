import {
  TransactionController,
  TransactionControllerMessenger,
  TransactionControllerOptions,
} from '@metamask/transaction-controller';
import { TransactionControllerInitMessenger } from '../messengers/transaction-controller-messenger';
import {
  buildControllerGetApiRequestMock,
  buildControllerInitRequestMock,
  CHAIN_ID_MOCK,
  expectValidMessengerCallback,
} from '../test/utils';
import { TransactionControllerInit } from './transaction-controller-init';

const TRANSACTION_ID_MOCK = '123-456';

jest.mock('@metamask/transaction-controller');

function buildInitRequestMock() {
  return buildControllerInitRequestMock<
    TransactionControllerMessenger,
    TransactionControllerInitMessenger
  >();
}

function buildGetApiRequestMock() {
  const request = buildControllerGetApiRequestMock<TransactionController>();

  request.controller.abortTransactionSigning = jest.fn();
  request.controller.getLayer1GasFee = jest.fn();
  request.controller.getTransactions = jest.fn();
  request.controller.updateEditableParams = jest.fn();
  request.controller.updatePreviousGasParams = jest.fn();
  request.controller.updateTransactionGasFees = jest.fn();
  request.controller.updateTransactionSendFlowHistory = jest.fn();

  return request;
}

describe('Transaction Controller Init', () => {
  const transactionControllerClassMock = jest.mocked(TransactionController);

  function testConstructorProperty<
    T extends keyof TransactionControllerOptions,
  >(
    property: T,
    controllerProperties: Record<string, unknown> = {},
  ): TransactionControllerOptions[T] {
    const requestMock = buildInitRequestMock();

    requestMock.getController.mockReturnValue({
      getNetworkClientRegistry: jest.fn().mockReturnValue({}),
      ...controllerProperties,
    });

    new TransactionControllerInit().init(requestMock);

    return transactionControllerClassMock.mock.calls[0][0][property];
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('init', () => {
    it('returns controller instance', () => {
      const requestMock = buildInitRequestMock();
      expect(new TransactionControllerInit().init(requestMock)).toBeInstanceOf(
        TransactionController,
      );
    });

    it('retrieves saved gas fees from preferences', () => {
      const getSavedGasFees = testConstructorProperty('getSavedGasFees', {
        state: {
          advancedGasFee: {
            [CHAIN_ID_MOCK]: {
              maxBaseFee: '0x1',
              priorityFee: '0x2',
            },
          },
        },
      });

      expect(getSavedGasFees?.(undefined as never)).toStrictEqual({
        maxBaseFee: '0x1',
        priorityFee: '0x2',
      });
    });

    describe('determines incoming transactions is enabled', () => {
      it('when enabled in preferences and onboarding complete', () => {
        const incomingTransactionsIsEnabled = testConstructorProperty(
          'incomingTransactions',
          {
            state: {
              completedOnboarding: true,
              incomingTransactionsPreferences: {
                [CHAIN_ID_MOCK]: true,
              },
            },
          },
        )?.isEnabled;

        expect(incomingTransactionsIsEnabled?.()).toBe(true);
      });

      it('unless enabled in preferences but onboarding incomplete', () => {
        const incomingTransactionsIsEnabled = testConstructorProperty(
          'incomingTransactions',
          {
            state: {
              completedOnboarding: false,
              incomingTransactionsPreferences: {
                [CHAIN_ID_MOCK]: true,
              },
            },
          },
        )?.isEnabled;

        expect(incomingTransactionsIsEnabled?.()).toBe(false);
      });

      it('unless disabled in preferences and onboarding complete', () => {
        const incomingTransactionsIsEnabled = testConstructorProperty(
          'incomingTransactions',
          {
            state: {
              completedOnboarding: true,
              incomingTransactionsPreferences: {
                [CHAIN_ID_MOCK]: false,
              },
            },
          },
        )?.isEnabled;

        expect(incomingTransactionsIsEnabled?.()).toBe(false);
      });
    });

    it('determines if first time interaction enabled using preference', () => {
      const isFirstTimeInteractionEnabled = testConstructorProperty(
        'isFirstTimeInteractionEnabled',
        {
          state: {
            securityAlertsEnabled: true,
          },
        },
      );

      expect(isFirstTimeInteractionEnabled?.()).toBe(true);
    });

    it('determines if simulation enabled using preference', () => {
      const isSimulationEnabled = testConstructorProperty(
        'isSimulationEnabled',
        {
          state: {
            useTransactionSimulations: true,
          },
        },
      );

      expect(isSimulationEnabled?.()).toBe(true);
    });
  });

  describe('getControllerMessengerCallback', () => {
    it('returns a valid messenger callback', () => {
      expectValidMessengerCallback(
        new TransactionControllerInit().getControllerMessengerCallback(),
      );
    });
  });

  describe('getInitMessengerCallback', () => {
    it('returns a valid messenger callback', () => {
      expectValidMessengerCallback(
        new TransactionControllerInit().getInitMessengerCallback(),
      );
    });
  });

  describe('getApi', () => {
    it('returns multiple API methods', () => {
      const request = buildGetApiRequestMock();

      expect(Object.keys(new TransactionControllerInit().getApi(request)))
        .toMatchInlineSnapshot(`
        [
          "abortTransactionSigning",
          "createCancelTransaction",
          "getLayer1GasFee",
          "getTransactions",
          "updateEditableParams",
          "updatePreviousGasParams",
          "updateTransactionGasFees",
          "updateTransactionSendFlowHistory",
        ]
      `);
    });

    describe('returns createCancelTransaction method that', () => {
      it('calls stopTransaction on the controller', () => {
        const request = buildGetApiRequestMock();
        request.controller.stopTransaction = jest.fn();

        const api = new TransactionControllerInit().getApi(request);

        api.createCancelTransaction(TRANSACTION_ID_MOCK);

        expect(request.controller.stopTransaction).toHaveBeenCalledTimes(1);
        expect(request.controller.stopTransaction).toHaveBeenCalledWith(
          TRANSACTION_ID_MOCK,
        );
      });

      it('returns flat state', async () => {
        const flatStateMock = { test: 123 };

        const request = buildGetApiRequestMock();
        request.controller.stopTransaction = jest.fn();
        request.getFlatState.mockReturnValue(flatStateMock);

        const api = new TransactionControllerInit().getApi(request);
        const state = await api.createCancelTransaction(TRANSACTION_ID_MOCK);

        expect(state).toStrictEqual(flatStateMock);
      });
    });
  });
});
