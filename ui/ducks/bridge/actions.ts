// TODO: Remove restricted import
// eslint-disable-next-line import/no-restricted-paths
import { Hex } from '@metamask/utils';
import { zeroAddress } from 'ethereumjs-util';
import { TransactionType } from '@metamask/transaction-controller';
import { useHistory } from 'react-router-dom';
import { BigNumber } from 'bignumber.js';
import {
  BridgeBackgroundAction,
  BridgeUserAction,
  // TODO: Remove restricted import
  // eslint-disable-next-line import/no-restricted-paths
} from '../../../app/scripts/controllers/bridge/types';
import {
  addToken,
  addTransactionAndWaitForPublish,
  forceUpdateMetamaskState,
  addNetwork,
  setDefaultHomeActiveTabName,
} from '../../store/actions';
import { submitRequestToBackground } from '../../store/background-connection';
import { QuoteRequest } from '../../pages/bridge/types';
import {
  AssetWithDisplayData,
  ERC20Asset,
  NativeAsset,
} from '../../components/multichain/asset-picker-amount/asset-picker-modal/types';
import { Numeric } from '../../../shared/modules/Numeric';
import {
  SwapsTokenObject,
  DEFAULT_TOKEN_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
} from '../../../shared/constants/swaps';
import {
  SwapsEthToken,
  checkNetworkAndAccountSupports1559,
  getIsBridgeChain,
  getIsBridgeEnabled,
  getNetworkConfigurationsByChainId,
  getSelectedNetworkClientId,
} from '../../selectors';
import { MetaMaskReduxDispatch, MetaMaskReduxState } from '../../store/store';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import { getGasFeeEstimates } from '../metamask/metamask';
import { decGWEIToHexWEI } from '../../../shared/modules/conversion.utils';
import { FEATURED_RPCS } from '../../../shared/constants/network';
import { MetaMetricsNetworkEventSource } from '../../../shared/constants/metametrics';
import {
  getEthUsdtApproveResetTxParams,
  isEthUsdt,
} from '../../pages/bridge/bridge.util';
import { ETH_USDT_ADDRESS, FeeType } from '../../../shared/constants/bridge';
import BridgeController from '../../../app/scripts/controllers/bridge/bridge-controller';
import { bridgeSlice } from './bridge';
import {
  DUMMY_QUOTES_APPROVAL,
  DUMMY_QUOTES_NO_APPROVAL,
} from './dummy-quotes';
import { getBridgeGasMultipliers } from './selectors';

const {
  setToChainId,
  setFromToken,
  setToToken,
  setFromTokenInputValue,
  resetInputFields,
} = bridgeSlice.actions;

export {
  setToChainId,
  resetInputFields,
  setToToken,
  setFromToken,
  setFromTokenInputValue,
};

const callBridgeControllerMethod = <T>(
  bridgeAction: BridgeUserAction | BridgeBackgroundAction,
  args?: T,
) => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    await submitRequestToBackground(bridgeAction, [args]);
    await forceUpdateMetamaskState(dispatch);
  };
};

// Background actions
export const setBridgeFeatureFlags = () => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    return dispatch(
      callBridgeControllerMethod(BridgeBackgroundAction.SET_FEATURE_FLAGS),
    );
  };
};

export const resetBridgeState = () => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    dispatch(resetInputFields());
    dispatch(callBridgeControllerMethod(BridgeBackgroundAction.RESET_STATE));
  };
};

// User actions
export const setFromChain = (chainId: Hex) => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    dispatch(
      callBridgeControllerMethod<Hex>(
        BridgeUserAction.SELECT_SRC_NETWORK,
        chainId,
      ),
    );
  };
};

export const setToChain = (chainId: Hex) => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    dispatch(
      callBridgeControllerMethod<Hex>(
        BridgeUserAction.SELECT_DEST_NETWORK,
        chainId,
      ),
    );
  };
};

export const updateQuoteRequestParams = (params: Partial<QuoteRequest>) => {
  return async (dispatch: MetaMaskReduxDispatch) => {
    await dispatch(
      callBridgeControllerMethod(BridgeUserAction.UPDATE_QUOTE_PARAMS, params),
    );
  };
};

export const getBridgeERC20Allowance = async (
  contractAddress: string,
  walletAddress: string,
  chainId: Hex,
): ReturnType<BridgeController['getBridgeERC20Allowance']> => {
  return await submitRequestToBackground(
    BridgeBackgroundAction.GET_BRIDGE_ERC20_ALLOWANCE,
    [contractAddress, walletAddress, chainId],
  );
};

export const signBridgeTransaction = (
  history: ReturnType<typeof useHistory>,
) => {
  return async (
    dispatch: MetaMaskReduxDispatch,
    getState: () => MetaMaskReduxState,
  ) => {
    const state = getState();
    const isBridgeEnabled = getIsBridgeEnabled(state);
    const isBridgeChain = getIsBridgeChain(state);

    if (!(isBridgeEnabled && isBridgeChain)) {
      // TODO do we want to do something here?
      return;
    }

    const quoteMeta = DUMMY_QUOTES_APPROVAL[0]; // TODO: actually use live quotes
    // const quoteMeta = DUMMY_QUOTES_NO_APPROVAL[0]; // TODO: actually use live quotes

    // Track event TODO

    const calcFeePerGas = () => {
      let maxFeePerGas: undefined | string;
      let maxPriorityFeePerGas: undefined | string;
      // let baseAndPriorityFeePerGas;
      // let decEstimatedBaseFee;

      const networkAndAccountSupports1559 =
        checkNetworkAndAccountSupports1559(state);

      if (networkAndAccountSupports1559) {
        const {
          high: { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas },
          // estimatedBaseFee = '0',
        } = getGasFeeEstimates(state);
        // decEstimatedBaseFee = decGWEIToHexWEI(estimatedBaseFee);
        maxFeePerGas = decGWEIToHexWEI(suggestedMaxFeePerGas);
        maxPriorityFeePerGas = decGWEIToHexWEI(suggestedMaxPriorityFeePerGas);
        // baseAndPriorityFeePerGas = addHexes(
        //   decEstimatedBaseFee,
        //   maxPriorityFeePerGas,
        // );
      }

      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
      };
    };

    const calcMaxGasLimit = (gasLimit: number) => {
      // @ts-expect-error BridgeState is contained in state
      const gasMultiplier = getBridgeGasMultipliers(state)[chainId];
      return new Numeric(
        new BigNumber(gasLimit).times(gasMultiplier).round(0).toString(),
        10,
      ).toPrefixedHexString();
    };

    const handleEthUsdtAllowanceReset = async ({
      hexChainId,
      maxFeePerGas,
      maxPriorityFeePerGas,
    }: {
      hexChainId: Hex;
      maxFeePerGas: string;
      maxPriorityFeePerGas: string;
    }) => {
      const allowance = new BigNumber(
        await getBridgeERC20Allowance(
          ETH_USDT_ADDRESS,
          quoteMeta.approval.from,
          hexChainId,
        ),
      );

      // quote.srcTokenAmount is actually after the fees
      // so we need to add fees back in for total allowance to give
      const sentAmount = new BigNumber(quoteMeta.quote.srcTokenAmount)
        .plus(quoteMeta.quote.feeData[FeeType.METABRIDGE].amount)
        .toString();

      const shouldResetApproval = allowance.lt(sentAmount) && allowance.gt(0);

      if (shouldResetApproval) {
        const maxGasLimit = calcMaxGasLimit(quoteMeta.approval.gasLimit);
        const txParams = getEthUsdtApproveResetTxParams({
          ...quoteMeta.approval,
          chainId: hexChainId,
          gasLimit: maxGasLimit,
          gas: maxGasLimit, // must set this field
          maxFeePerGas,
          maxPriorityFeePerGas,
        });

        await addTransactionAndWaitForPublish(txParams, {
          requireApproval: false,
          // @ts-expect-error Need TransactionController v37+, TODO add this type
          type: 'bridgeApproval', // TransactionType.bridgeApproval,

          // TODO update TransactionController to change this to a bridge field
          // swaps.meta is of type Partial<TransactionMeta>, will get merged with TransactionMeta by the TransactionController
          swaps: {
            hasApproveTx: true,
            meta: {
              type: 'bridgeApproval', // TransactionType.bridgeApproval, // TODO
              sourceTokenSymbol: quoteMeta.quote.srcAsset.symbol,
            },
          },
        });
      }
    };

    const handleApprovalTx = async ({
      maxFeePerGas,
      maxPriorityFeePerGas,
    }: {
      maxFeePerGas: string | undefined;
      maxPriorityFeePerGas: string | undefined;
    }) => {
      console.log('Bridge', 'handleApprovalTx');

      const { chainId } = quoteMeta.approval;
      const hexChainId = new Numeric(
        chainId,
        10,
      ).toPrefixedHexString() as `0x${string}`;
      if (!hexChainId) {
        throw new Error('Invalid chain ID');
      }

      // On Ethereum, we need to reset the allowance to 0 for USDT first if we need to set a new allowance
      // https://www.google.com/url?q=https://docs.unizen.io/trade-api/before-you-get-started/token-allowance-management-for-non-updatable-allowance-tokens&sa=D&source=docs&ust=1727386175513609&usg=AOvVaw3Opm6BSJeu7qO0Ve5iLTOh
      if (isEthUsdt(hexChainId, quoteMeta.quote.srcAsset.address)) {
        await handleEthUsdtAllowanceReset({
          hexChainId,
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
      }

      const maxGasLimit = calcMaxGasLimit(quoteMeta.approval.gasLimit);
      const txParams = {
        ...quoteMeta.approval,
        chainId: hexChainId,
        gasLimit: maxGasLimit,
        gas: maxGasLimit, // must set this field
        maxFeePerGas,
        maxPriorityFeePerGas,
      };
      const txMeta = await addTransactionAndWaitForPublish(txParams, {
        requireApproval: false,
        // @ts-expect-error Need TransactionController v37+, TODO add this type
        type: 'bridgeApproval', // TransactionType.bridgeApproval,

        // TODO update TransactionController to change this to a bridge field
        // swaps.meta is of type Partial<TransactionMeta>, will get merged with TransactionMeta by the TransactionController
        swaps: {
          hasApproveTx: true,
          meta: {
            type: 'bridgeApproval', // TransactionType.bridgeApproval, // TODO
            sourceTokenSymbol: quoteMeta.quote.srcAsset.symbol,
          },
        },
      });
      await forceUpdateMetamaskState(dispatch);

      console.log('Bridge', { approvalTxId: txMeta.id });
      return txMeta.id;
    };

    const handleBridgeTx = async ({
      approvalTxId,
      maxFeePerGas,
      maxPriorityFeePerGas,
    }: {
      approvalTxId: string | undefined;
      maxFeePerGas: string | undefined;
      maxPriorityFeePerGas: string | undefined;
    }) => {
      console.log('Bridge', 'handleBridgeTx');
      const hexChainId = new Numeric(
        quoteMeta.trade.chainId,
        10,
      ).toPrefixedHexString() as `0x${string}`;
      if (!hexChainId) {
        throw new Error('Invalid chain ID');
      }

      const maxGasLimit = calcMaxGasLimit(quoteMeta.trade.gasLimit);
      const txParams = {
        ...quoteMeta.trade,
        chainId: hexChainId,
        gasLimit: maxGasLimit,
        gas: maxGasLimit, // must set this field
        maxFeePerGas,
        maxPriorityFeePerGas,
      };
      const txMeta = await addTransactionAndWaitForPublish(txParams, {
        requireApproval: false,
        // @ts-expect-error Need TransactionController v37+, TODO add this type
        type: 'bridge', // TransactionType.bridge,

        // TODO update TransactionController to change this to a bridge field
        swaps: {
          hasApproveTx: Boolean(quoteMeta?.approval),
          meta: {
            // estimatedBaseFee: decEstimatedBaseFee,
            // swapMetaData,
            type: 'bridge', // TransactionType.bridge, // TODO add this type
            sourceTokenSymbol: quoteMeta.quote.srcAsset.symbol,
            destinationTokenSymbol: quoteMeta.quote.destAsset.symbol,
            destinationTokenDecimals: quoteMeta.quote.destAsset.decimals,
            destinationTokenAddress: quoteMeta.quote.destAsset.address,
            approvalTxId,
            // this is the decimal (non atomic) amount (not USD value) of source token to swap
            swapTokenValue: new Numeric(
              quoteMeta.quote.srcTokenAmount,
              10,
            ).shiftedBy(quoteMeta.quote.srcAsset.decimals),
          },
        },
      });
      await forceUpdateMetamaskState(dispatch);

      console.log('Bridge', { bridgeTxId: txMeta.id });
      return txMeta.id;
    };

    const addSourceToken = () => {
      const sourceNetworkClientId: string = getSelectedNetworkClientId(state);
      const {
        address,
        decimals,
        symbol,
        icon: image,
        chainId,
      } = quoteMeta.quote.srcAsset;

      const srcHexChainId = new Numeric(
        quoteMeta.quote.srcChainId,
        10,
      ).toPrefixedHexString() as `0x${string}`;
      const tokenHexChainId = new Numeric(
        chainId,
        10,
      ).toPrefixedHexString() as `0x${string}`;

      if (tokenHexChainId !== srcHexChainId) {
        throw new Error('Token chain ID does not match source chain ID');
      }

      dispatch(
        addToken({
          address,
          decimals,
          symbol,
          image,
          networkClientId: sourceNetworkClientId,
        }),
      );
    };

    const addDestToken = async () => {
      // Look up the destination chain
      const hexDestChainId = new Numeric(quoteMeta.quote.destChainId, 10)
        .toPrefixedHexString()
        .toLowerCase() as `0x${string}`;
      const networkConfigurations = getNetworkConfigurationsByChainId(state);
      const destNetworkConfig = networkConfigurations[hexDestChainId];

      // If user has not added the network in MetaMask, add it for them silently
      if (!destNetworkConfig) {
        const featuredRpc = FEATURED_RPCS.find(
          (rpc) => rpc.chainId === hexDestChainId,
        );
        if (!featuredRpc) {
          throw new Error('No featured RPC found');
        }
        await dispatch(addNetwork(featuredRpc));
      }

      // Add the token after network is guaranteed to exist
      const rpcEndpointIndex = destNetworkConfig.defaultRpcEndpointIndex;
      const destNetworkClientId =
        destNetworkConfig.rpcEndpoints[rpcEndpointIndex].networkClientId;
      const {
        address,
        decimals,
        symbol,
        icon: image,
      } = quoteMeta.quote.destAsset;
      await dispatch(
        addToken({
          address,
          decimals,
          symbol,
          image,
          networkClientId: destNetworkClientId,
        }),
      );
    };

    const execute = async () => {
      const { maxFeePerGas, maxPriorityFeePerGas } = calcFeePerGas();

      // Execute transaction(s)
      let approvalTxId: string | undefined;
      if (quoteMeta?.approval) {
        approvalTxId = await handleApprovalTx({
          maxFeePerGas,
          maxPriorityFeePerGas,
        });
      }
      await handleBridgeTx({
        approvalTxId,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      // Add tokens if not the native gas token
      if (quoteMeta.quote.srcAsset.address !== DEFAULT_TOKEN_ADDRESS) {
        addSourceToken();
      }
      if (quoteMeta.quote.destAsset.address !== DEFAULT_TOKEN_ADDRESS) {
        await addDestToken();
      }

      // Route user to activity tab on Home page
      await dispatch(setDefaultHomeActiveTabName('activity'));
      history.push(DEFAULT_ROUTE);
    };

    await execute();
  };
};
