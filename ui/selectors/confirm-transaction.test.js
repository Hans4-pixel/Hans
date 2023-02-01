import { CHAIN_IDS, NetworkStatus } from '../../shared/constants/network';
import { TransactionType } from '../../shared/constants/transaction';
import {
  unconfirmedTransactionsCountSelector,
  sendTokenTokenAmountAndToAddressSelector,
  contractExchangeRateSelector,
  conversionRateSelector,
} from './confirm-transaction';

const getEthersArrayLikeFromObj = (obj) => {
  const arr = [];
  Object.keys(obj).forEach((key) => {
    arr.push([obj[key]]);
    arr[key] = obj[key];
  });
  return arr;
};

describe('Confirm Transaction Selector', () => {
  describe('unconfirmedTransactionsCountSelector', () => {
    const state = {
      metamask: {
        unapprovedTxs: {
          1: {
            chainId: CHAIN_IDS.GOERLI,
          },
          2: {
            chainId: CHAIN_IDS.MAINNET,
          },
        },
        unapprovedMsgCount: 1,
        unapprovedPersonalMsgCount: 1,
        unapprovedTypedMessagesCount: 1,
        networkStatus: NetworkStatus.Available,
        provider: {
          chainId: CHAIN_IDS.GOERLI,
        },
      },
    };

    it('returns number of txs in unapprovedTxs state with the same network plus unapproved signing method counts', () => {
      expect(unconfirmedTransactionsCountSelector(state)).toStrictEqual(4);
    });
  });

  describe('sendTokenTokenAmountAndToAddressSelector', () => {
    const state = {
      confirmTransaction: {
        tokenData: {
          name: TransactionType.tokenMethodTransfer,
          args: getEthersArrayLikeFromObj({
            _to: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            _value: { toString: () => '1' },
          }),
        },
        tokenProps: {
          decimals: '2',
          symbol: 'META',
        },
      },
    };

    it('returns token address and calculated token amount', () => {
      expect(sendTokenTokenAmountAndToAddressSelector(state)).toStrictEqual({
        toAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        tokenAmount: '0.01',
      });
    });
  });

  describe('contractExchangeRateSelector', () => {
    const state = {
      metamask: {
        contractExchangeRates: {
          '0xTokenAddress': '10',
        },
      },
      confirmTransaction: {
        txData: {
          txParams: {
            to: '0xTokenAddress',
          },
        },
      },
    };

    it('returns contract exchange rate in metamask state based on confirm transaction txParams token recipient', () => {
      expect(contractExchangeRateSelector(state)).toStrictEqual('10');
    });
  });

  describe('conversionRateSelector', () => {
    it('returns conversionRate from state', () => {
      const state = {
        metamask: { conversionRate: 556.12 },
      };
      expect(conversionRateSelector(state)).toStrictEqual(556.12);
    });
  });
});
