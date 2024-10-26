import {
  ControllerStateChangeEvent,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import {
  NetworkControllerFindNetworkClientIdByChainIdAction,
  NetworkControllerGetNetworkClientByIdAction,
  NetworkControllerGetStateAction,
} from '@metamask/network-controller';
import { AccountsControllerGetSelectedAccountAction } from '@metamask/accounts-controller';
import { ChainId, Quote } from '../../../../ui/pages/bridge/types';
import { BRIDGE_STATUS_CONTROLLER_NAME } from './constants';
import BridgeStatusController from './bridge-status-controller';

export type StatusRequest = {
  bridgeId: string; // lifi, socket, squid
  srcTxHash: string; // lifi, socket, squid
  bridge: string; // lifi, socket, squid
  srcChainId: ChainId; // lifi, socket, squid
  destChainId: ChainId; // lifi, socket, squid
  quote?: Quote; // squid
  refuel?: boolean; // lifi
};

export type Asset = {
  chainId: ChainId;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
};

export type SrcChainStatus = {
  chainId: ChainId;
  txHash: string;
  amount?: string;
  token?: Asset;
};

export type DestChainStatus = SrcChainStatus & {
  txHash?: string;
  amount?: string;
  token?: Record<string, never> | Asset;
};

export enum StatusTypes {
  UNKNOWN = 'UNKNOWN',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

export type RefuelStatusResponse = {} & StatusResponse;

export enum BridgeId {
  HOP = 'hop',
  CELER = 'celer',
  CELERCIRCLE = 'celercircle',
  CONNEXT = 'connext',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  MULTICHAIN = 'multichain',
  AXELAR = 'axelar',
  ACROSS = 'across',
  STARGATE = 'stargate',
}

export type StatusResponse = {
  status: StatusTypes;
  srcChain: SrcChainStatus;
  destChain?: DestChainStatus;
  bridge?: BridgeId;
  isExpectedToken?: boolean;
  isUnrecognizedRouterAddress?: boolean;
  refuel?: RefuelStatusResponse;
};

export enum FeeType {
  METABRIDGE = 'metabridge',
  REFUEL = 'refuel',
}

export type FeeData = {
  amount: string;
  asset: Asset;
};

export type Protocol = {
  displayName?: string;
  icon?: string;
  name?: string; // for legacy quotes
};

export enum ActionTypes {
  BRIDGE = 'bridge',
  SWAP = 'swap',
  REFUEL = 'refuel',
}

export type Step = {
  action: ActionTypes;
  srcChainId: ChainId;
  destChainId?: ChainId;
  srcAsset: Asset;
  destAsset: Asset;
  srcAmount: string;
  destAmount: string;
  protocol: Protocol;
};
export type RefuelData = {} & Step;

export type BridgeHistoryItem = {
  quote: Quote;
  status?: StatusResponse;
  startTime?: number;
  estimatedProcessingTimeInSeconds: number;
  slippagePercentage: number;
  completionTime?: number;
  pricingData?: {
    quotedGasInUsd: number;
    quotedReturnInUsd: number;
    amountSentInUsd: number;
    quotedRefuelSrcAmountInUsd?: number;
    quotedRefuelDestAmountInUsd?: number;
  };
  initialDestAssetBalance?: number;
  targetContractAddress?: string;
  account: string;
};

// All fields need to be types not interfaces, same with their children fields
// o/w you get a type error
type SourceChainTxHash = string;
export type BridgeStatusControllerState = {
  txHistory: Record<SourceChainTxHash, BridgeHistoryItem>;
};

export enum BridgeStatusAction {
  START_POLLING_FOR_BRIDGE_TX_STATUS = 'startPollingForBridgeTxStatus',
  WIPE_BRIDGE_STATUS = 'wipeBridgeStatus',
}

type BridgeStatusControllerAction<
  FunctionName extends keyof BridgeStatusController,
> = {
  type: `${typeof BRIDGE_STATUS_CONTROLLER_NAME}:${FunctionName}`;
  handler: BridgeStatusController[FunctionName];
};

// Maps to BridgeController function names
type BridgeStatusControllerActions =
  | BridgeStatusControllerAction<BridgeStatusAction.START_POLLING_FOR_BRIDGE_TX_STATUS>
  | BridgeStatusControllerAction<BridgeStatusAction.WIPE_BRIDGE_STATUS>;

type BridgeStatusControllerEvents = ControllerStateChangeEvent<
  typeof BRIDGE_STATUS_CONTROLLER_NAME,
  BridgeStatusControllerState
>;

type AllowedActions =
  | NetworkControllerFindNetworkClientIdByChainIdAction
  | NetworkControllerGetStateAction
  | NetworkControllerGetNetworkClientByIdAction
  | AccountsControllerGetSelectedAccountAction;
type AllowedEvents = never;

/**
 * The messenger for the BridgeStatusController.
 */
export type BridgeStatusControllerMessenger = RestrictedControllerMessenger<
  typeof BRIDGE_STATUS_CONTROLLER_NAME,
  BridgeStatusControllerActions | AllowedActions,
  BridgeStatusControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;
