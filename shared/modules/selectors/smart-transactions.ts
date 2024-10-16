import { createSelector } from 'reselect';
import {
  getAllowedSmartTransactionsChainIds,
  SKIP_STX_RPC_URL_CHECK_CHAIN_IDS,
} from '../../constants/smartTransactions';
import {
  getCurrentChainId,
  getCurrentNetwork,
  accountSupportsSmartTx,
  getSelectedAccount,
  getPreferences,
  // TODO: Remove restricted import
  // eslint-disable-next-line import/no-restricted-paths
} from '../../../ui/selectors/selectors'; // TODO: Migrate shared selectors to this file.
import { isProduction } from '../environment';

// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { MultichainState } from '../../../ui/selectors/multichain';

type SmartTransactionsMetaMaskState = {
  metamask: {
    preferences: {
      smartTransactionsOptInStatus?: boolean | null;
    };
    internalAccounts: {
      selectedAccount: string;
      accounts: {
        [key: string]: {
          metadata: {
            keyring: {
              type: string;
            };
          };
        };
      };
    };
    swapsState: {
      swapsFeatureFlags: {
        ethereum: {
          extensionActive: boolean;
          mobileActive: boolean;
          smartTransactions: {
            expectedDeadline?: number;
            maxDeadline?: number;
            returnTxHashAsap?: boolean;
          };
        };
        smartTransactions: {
          extensionActive: boolean;
          mobileActive: boolean;
        };
      };
    };
    smartTransactionsState: {
      liveness: boolean;
    };
  };
};

/**
 * Returns the user's explicit opt-in status for the smart transactions feature.
 *
 * Do not export this selector. It should only be used internally within this file.
 *
 * @param state - The state object.
 * @returns true if the user has explicitly opted in, false if they have opted out,
 * or null if they have not explicitly opted in or out.
 */
const getSmartTransactionsOptInStatusInternal = createSelector(
  getPreferences,
  (preferences: {
    smartTransactionsOptInStatus?: boolean | null;
  }): boolean | null => {
    return preferences?.smartTransactionsOptInStatus ?? null;
  },
);

/**
 * Returns the user's explicit opt-in status for the smart transactions feature.
 * This should only be used for metrics collection, and not for determining if the
 * smart transactions user preference is enabled.
 *
 * To determine if the smart transactions user preference is enabled, use
 * getSmartTransactionsPreferenceEnabled instead.
 *
 * @param state - The state object.
 * @returns true if the user has explicitly opted in, false if they have opted out,
 * or null if they have not explicitly opted in or out.
 */
export const getSmartTransactionsOptInStatusForMetrics = createSelector(
  getSmartTransactionsOptInStatusInternal,
  (optInStatus: boolean | null): boolean | null => optInStatus,
);

/**
 * Returns the user's preference for the smart transactions feature.
 * Defaults to `true` if the user has not set a preference.
 *
 * @param state
 * @returns
 */
export const getSmartTransactionsPreferenceEnabled = createSelector(
  getSmartTransactionsOptInStatusInternal,
  (optInStatus: boolean | null): boolean => {
    // In the absence of an explicit opt-in or opt-out,
    // the Smart Transactions toggle is enabled.
    const DEFAULT_SMART_TRANSACTIONS_ENABLED = true;
    return optInStatus ?? DEFAULT_SMART_TRANSACTIONS_ENABLED;
  },
);

export const getCurrentChainSupportsSmartTransactions = (
  state: SmartTransactionsMetaMaskState,
): boolean => {
  const chainId = getCurrentChainId(state);
  return getAllowedSmartTransactionsChainIds().includes(chainId);
};

const getIsAllowedRpcUrlForSmartTransactions = (
  state: SmartTransactionsMetaMaskState,
) => {
  const chainId = getCurrentChainId(state);
  if (!isProduction() || SKIP_STX_RPC_URL_CHECK_CHAIN_IDS.includes(chainId)) {
    // Allow any STX RPC URL in development and testing environments or for specific chain IDs.
    return true;
  }
  const currentNetwork = getCurrentNetwork(state);
  if (!currentNetwork?.rpcUrl) {
    return false;
  }
  const rpcUrl = new URL(currentNetwork.rpcUrl);
  // Only allow STX in prod if an Infura RPC URL is being used.
  return rpcUrl?.hostname?.endsWith('.infura.io');
};

/**
 * Checks if the selected account has a non-zero balance.
 *
 * @param state - The state object containing account information.
 * @returns true if the selected account has a non-zero balance, otherwise false.
 */
const hasNonZeroBalance = (state: SmartTransactionsMetaMaskState) => {
  const selectedAccount = getSelectedAccount(
    state as unknown as MultichainState,
  );
  return BigInt(selectedAccount?.balance || '0x0') > 0n;
};

export const getIsSmartTransactionsOptInModalAvailable = (
  state: SmartTransactionsMetaMaskState,
) => {
  return (
    getCurrentChainSupportsSmartTransactions(state) &&
    getIsAllowedRpcUrlForSmartTransactions(state) &&
    getSmartTransactionsOptInStatusInternal(state) === null &&
    hasNonZeroBalance(state)
  );
};

export const getSmartTransactionsEnabled = (
  state: SmartTransactionsMetaMaskState,
): boolean => {
  const supportedAccount = accountSupportsSmartTx(state);
  // TODO: Create a new proxy service only for MM feature flags.
  const smartTransactionsFeatureFlagEnabled =
    state.metamask.swapsState?.swapsFeatureFlags?.smartTransactions
      ?.extensionActive;
  const smartTransactionsLiveness =
    state.metamask.smartTransactionsState?.liveness;
  return Boolean(
    getCurrentChainSupportsSmartTransactions(state) &&
      getIsAllowedRpcUrlForSmartTransactions(state) &&
      supportedAccount &&
      smartTransactionsFeatureFlagEnabled &&
      smartTransactionsLiveness,
  );
};

export const getIsSmartTransaction = (
  state: SmartTransactionsMetaMaskState,
): boolean => {
  const smartTransactionsPreferenceEnabled =
    getSmartTransactionsPreferenceEnabled(state);
  const smartTransactionsEnabled = getSmartTransactionsEnabled(state);
  return Boolean(
    smartTransactionsPreferenceEnabled && smartTransactionsEnabled,
  );
};
