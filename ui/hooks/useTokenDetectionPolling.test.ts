import { renderHookWithProvider } from '../../test/lib/render-helpers';
import {
  tokenDetectionStartPolling,
  tokenDetectionStopPollingByPollingToken,
} from '../store/actions';
import useTokenDetectionPolling from './useTokenDetectionPolling';

let mockPromises: Promise<string>[];

jest.mock('../store/actions', () => ({
  tokenDetectionStartPolling: jest.fn().mockImplementation((input) => {
    console.log('PASSING HERE ....', input);
    const promise = Promise.resolve(`${input}_detection`);
    mockPromises.push(promise);
    return promise;
  }),
  tokenDetectionStopPollingByPollingToken: jest.fn(),
}));

describe('useTokenDetectionPolling', () => {
  beforeEach(() => {
    mockPromises = [];
    jest.clearAllMocks();
  });

  it('should poll token detection for chain IDs when enabled and stop on dismount', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useTokenDetection: true,
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
      () => useTokenDetectionPolling(),
      state,
    );

    // Should poll each chain
    await Promise.all(mockPromises);
    expect(tokenDetectionStartPolling).toHaveBeenCalledTimes(1);
    expect(tokenDetectionStartPolling).toHaveBeenCalledWith(['0x1']);

    // Stop polling on dismount
    unmount();
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledTimes(1);
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledWith(
      '0x1_detection',
    );
  });

  it('should not poll if onboarding is not completed', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: false,
        useTokenDetection: true,
        networkConfigurationsByChainId: {
          '0x1': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenDetectionPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenDetectionStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when locked', async () => {
    const state = {
      metamask: {
        isUnlocked: false,
        completedOnboarding: true,
        useTokenDetection: true,
        networkConfigurationsByChainId: {
          '0x1': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenDetectionPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenDetectionStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when token detection is disabled', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useTokenDetection: false,
        networkConfigurationsByChainId: {
          '0x1': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenDetectionPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenDetectionStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });

  it('should not poll when no chains are provided', async () => {
    const state = {
      metamask: {
        isUnlocked: true,
        completedOnboarding: true,
        useTokenDetection: true,
        networkConfigurationsByChainId: {
          '0x1': {},
        },
      },
    };

    renderHookWithProvider(() => useTokenDetectionPolling(), state);

    await Promise.all(mockPromises);
    expect(tokenDetectionStartPolling).toHaveBeenCalledTimes(0);
    expect(tokenDetectionStopPollingByPollingToken).toHaveBeenCalledTimes(0);
  });
});
