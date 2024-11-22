import { renderHookWithProvider } from '../../test/lib/render-helpers';
import {
  tokenRatesStartPolling,
  tokenRatesStopPollingByPollingToken,
} from '../store/actions';
import useTokenRatesPolling from './useTokenRatesPolling';

let mockPromises: Promise<string>[];

jest.mock('../store/actions', () => ({
  tokenRatesStartPolling: jest.fn().mockImplementation((input) => {
    const promise = Promise.resolve(`${input}_rates`);
    mockPromises.push(promise);
    return promise;
  }),
  tokenRatesStopPollingByPollingToken: jest.fn(),
}));

describe('useTokenRatesPolling', () => {
  beforeEach(() => {
    mockPromises = [];
    jest.clearAllMocks();
  });

  it('should poll token rates when enabled and stop on dismount', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useCurrencyRateCheck: true,
        selectedNetworkClientId: 'selectedNetworkClientId',
        networkConfigurationsByChainId: {
          '0x1': {
            chainId: '0x1',
            rpcEndpoints: [
              {
                networkClientId: 'selectedNetworkClientId',
              },
            ],
          },
        },
      },
    };

    const { unmount } = renderHookWithProvider(
      () => useTokenRatesPolling(),
      state,
    );

    // Should poll each chain
    await Promise.all(mockPromises);
    expect(tokenRatesStartPolling).toHaveBeenCalledTimes(1);
    expect(tokenRatesStartPolling).toHaveBeenCalledWith('0x1');

    // Stop polling on dismount
    unmount();
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledTimes(1);
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledWith(
      '0x1_rates',
    );
  });

  it('should not poll if onboarding is not completed', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: false,
        useCurrencyRateCheck: true,
        networkConfigurationsByChainId: {
          '0x1': {},
          '0x89': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenRatesPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenRatesStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when locked', async () => {
    const state = {
      metamask: {
        isUnlocked: false,
        completedOnboarding: true,
        useCurrencyRateCheck: true,
        networkConfigurationsByChainId: {
          '0x1': {},
          '0x89': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenRatesPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenRatesStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when rate checking is disabled', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useCurrencyRateCheck: false,
        networkConfigurationsByChainId: {
          '0x1': {},
          '0x89': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenRatesPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenRatesStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when no chains are provided', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useCurrencyRateCheck: true,
        networkConfigurationsByChainId: {},
      },
    };

    renderHookWithProvider(() => useTokenRatesPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenRatesStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenRatesStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });
});
