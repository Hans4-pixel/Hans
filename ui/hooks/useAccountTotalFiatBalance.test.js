import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks';

import mockState from '../../test/data/mock-state.json';
import configureStore from '../store/store';

import { CHAIN_IDS } from '../../shared/constants/network';
import { useAccountTotalFiatBalance } from './useAccountTotalFiatBalance';

jest.mock('./useTokenTracker', () => {
  return {
    useTokenTracker: () => ({
      loading: false,
      tokensWithBalances: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          balance: '48573',
          balanceError: null,
          decimals: 6,
          image: undefined,
          isERC721: undefined,
          string: '0.04857',
          symbol: 'USDC',
        },
        {
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          symbol: 'YFI',
          balance: '1409247882142934',
          decimals: 18,
          string: '0.001409247882142934',
          balanceError: null,
        },
      ],
      error: null,
    }),
  };
});

const renderUseAccountTotalFiatBalance = (address) => {
  const state = {
    ...mockState,
    metamask: {
      ...mockState.metamask,
      conversionRate: 1612.92,
      currentCurrency: 'usd',
      contractExchangeRates: {
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 0.0006189,
        '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': 3.304588,
      },
      cachedBalances: {
        [CHAIN_IDS.MAINNET]: {
          '0x0836f5ed6b62baf60706fe3adc0ff0fd1df833da': '0x041173b2c0e57d',
          '0xd8ad671f1fcc94bcf0ebc6ec4790da35e8d5e1e1': '0x048010d1739513',
        },
      },
      providerConfig: {
        chainId: CHAIN_IDS.MAINNET,
      },
      allTokens: {
        '0x1': {
          '0x0836f5ed6b62baf60706fe3adc0ff0fd1df833da': [
            {
              address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              decimals: 6,
              symbol: 'USDC',
            },
            {
              address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
              aggregators: [],
              decimals: 18,
              name: 'yearn.finance',
              symbol: 'YFI',
            },
          ],
        },
      },
    },
  };

  const wrapper = ({ children }) => (
    <Provider store={configureStore(state)}>{children}</Provider>
  );

  return renderHook(() => useAccountTotalFiatBalance(address), { wrapper });
};

describe('useAccountTotalFiatBalance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the correct result for account 1', () => {
    const { result } = renderUseAccountTotalFiatBalance(
      '0x0836f5ed6b62baf60706fe3adc0ff0fd1df833da',
    );
    expect(result.current).toStrictEqual({
      formattedFiat: '$9.41',
      totalWeiBalance: '14ba1e6a08a9ec',
      totalFiatBalance: '9.41',
      tokensWithBalances: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          balance: '48573',
          image: undefined,
          isERC721: undefined,
          decimals: 6,
          string: '0.04857',
          balanceError: null,
        },
        {
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          symbol: 'YFI',
          balance: '1409247882142934',
          decimals: 18,
          string: '0.001409247882142934',
          balanceError: null,
        },
      ],
      loading: false,
    });
  });
});
