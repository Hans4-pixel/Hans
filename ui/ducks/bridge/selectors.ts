import { NetworkState, ProviderConfig } from '@metamask/network-controller';
import { uniqBy } from 'lodash';
import {
  getAllNetworks,
  getIsBridgeEnabled,
  getSwapsDefaultToken,
  SwapsEthToken,
} from '../../selectors';
import * as swapsSlice from '../swaps/swaps';
import { ALLOWED_BRIDGE_CHAIN_IDS } from '../../../shared/constants/bridge';
import {
  BridgeControllerState,
  BridgeFeatureFlagsKey,
} from '../../../app/scripts/controllers/bridge/types';
import {
  FEATURED_RPCS,
  RPCDefinition,
} from '../../../shared/constants/network';
import { createDeepEqualSelector } from '../../selectors/util';
import { getProviderConfig } from '../metamask/metamask';
import { SwapsTokenObject } from '../../../shared/constants/swaps';
import { BridgeState } from './bridge';

type BridgeAppState = {
  metamask: NetworkState & { bridgeState: BridgeControllerState } & {
    useExternalServices: boolean;
  };
  bridge: BridgeState;
};

export const getFromChain = (state: BridgeAppState): ProviderConfig =>
  getProviderConfig(state);
export const getToChain = (state: BridgeAppState): ProviderConfig | null =>
  state.bridge.toChain;

export const getAllBridgeableNetworks = createDeepEqualSelector(
  (state: BridgeAppState) =>
    // includes networks user has added
    getAllNetworks({
      metamask: { networkConfigurations: state.metamask.networkConfigurations },
    }),
  (allNetworks): (ProviderConfig | RPCDefinition)[] => {
    return uniqBy([...allNetworks, ...FEATURED_RPCS], 'chainId').filter(
      ({ chainId }) => ALLOWED_BRIDGE_CHAIN_IDS.includes(chainId),
    );
  },
);
export const getFromChains = createDeepEqualSelector(
  getAllBridgeableNetworks,
  (state: BridgeAppState) => state.metamask.bridgeState?.bridgeFeatureFlags,
  (
    allBridgeableNetworks,
    bridgeFeatureFlags,
  ): (ProviderConfig | RPCDefinition)[] =>
    allBridgeableNetworks.filter(({ chainId }) =>
      bridgeFeatureFlags[BridgeFeatureFlagsKey.NETWORK_SRC_ALLOWLIST].includes(
        chainId,
      ),
    ),
);
export const getToChains = createDeepEqualSelector(
  getAllBridgeableNetworks,
  (state: BridgeAppState) => state.metamask.bridgeState?.bridgeFeatureFlags,
  (
    allBridgeableNetworks,
    bridgeFeatureFlags,
  ): (ProviderConfig | RPCDefinition)[] =>
    allBridgeableNetworks.filter(({ chainId }) =>
      bridgeFeatureFlags[BridgeFeatureFlagsKey.NETWORK_DEST_ALLOWLIST].includes(
        chainId,
      ),
    ),
);

export const getFromToken = (
  state: BridgeAppState,
): SwapsTokenObject | SwapsEthToken => {
  return state.bridge.fromToken || getSwapsDefaultToken(state);
};
export const getFromTokens = (state: BridgeAppState) => {
  return state.metamask.bridgeState.srcTokens;
};
export const getFromTopAssets = (state: BridgeAppState) => {
  return state.metamask.bridgeState.srcTopAssets;
};

export const getToToken = (
  state: BridgeAppState,
): SwapsTokenObject | SwapsEthToken | undefined => {
  return state.bridge.toToken;
};
export const getToTokens = (state: BridgeAppState) => {
  return state.bridge.toChain ? state.metamask.bridgeState.destTokens : {};
};
export const getToTopAssets = (state: BridgeAppState) => {
  return state.bridge.toChain ? state.metamask.bridgeState.destTopAssets : [];
};

export const getFromAmount = (state: BridgeAppState): string | undefined =>
  state.bridge.fromTokenInputValue;
export const getToAmount = (_state: BridgeAppState) => {
  return '0';
};

export const getIsBridgeTx = createDeepEqualSelector(
  getFromChain,
  getToChain,
  (state: BridgeAppState) => getIsBridgeEnabled(state),
  (fromChain, toChain, isBridgeEnabled: boolean) =>
    isBridgeEnabled &&
    toChain !== null &&
    fromChain.chainId !== toChain.chainId,
);
