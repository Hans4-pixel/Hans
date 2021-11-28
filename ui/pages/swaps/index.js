import React, { useEffect, useRef, useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  Redirect,
} from 'react-router-dom';
import { shuffle, isEqual } from 'lodash';
import { I18nContext } from '../../contexts/i18n';
import {
  getSelectedAccount,
  getCurrentChainId,
  getIsSwapsChain,
  isHardwareWallet,
  getHardwareWalletType,
  getTokenList,
} from '../../selectors/selectors';
import {
  getQuotes,
  clearSwapsState,
  getTradeTxId,
  getApproveTxId,
  getFetchingQuotes,
  setTopAssets,
  getFetchParams,
  setAggregatorMetadata,
  getAggregatorMetadata,
  getBackgroundSwapRouteState,
  getSwapsErrorKey,
  getSwapsFeatureIsLive,
  prepareToLeaveSwaps,
  fetchAndSetSwapsGasPriceInfo,
  fetchSwapsLiveness,
  getReviewSwapClickedTimestamp,
} from '../../ducks/swaps/swaps';
import {
  checkNetworkAndAccountSupports1559,
  currentNetworkTxListSelector,
} from '../../selectors';
import {
  AWAITING_SIGNATURES_ROUTE,
  AWAITING_SWAP_ROUTE,
  BUILD_QUOTE_ROUTE,
  VIEW_QUOTE_ROUTE,
  LOADING_QUOTES_ROUTE,
  SWAPS_ERROR_ROUTE,
  DEFAULT_ROUTE,
  SWAPS_MAINTENANCE_ROUTE,
} from '../../helpers/constants/routes';
import {
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
  SWAP_FAILED_ERROR,
  CONTRACT_DATA_DISABLED_ERROR,
  OFFLINE_FOR_MAINTENANCE,
} from '../../../shared/constants/swaps';

import {
  resetBackgroundSwapsState,
  setSwapsTokens,
  removeToken,
  setBackgroundSwapRouteState,
  setSwapsErrorKey,
} from '../../store/actions';

import { useNewMetricEvent } from '../../hooks/useMetricEvent';
import { useGasFeeEstimates } from '../../hooks/useGasFeeEstimates';
import FeatureToggledRoute from '../../helpers/higher-order-components/feature-toggled-route';
import { TRANSACTION_STATUSES } from '../../../shared/constants/transaction';
import {
  fetchTokens,
  fetchTopAssets,
  getSwapsTokensReceivedFromTxMeta,
  fetchAggregatorMetadata,
} from './swaps.util';
import AwaitingSignatures from './awaiting-signatures';
import AwaitingSwap from './awaiting-swap';
import LoadingQuote from './loading-swaps-quotes';
import BuildQuote from './build-quote';
import ViewQuote from './view-quote';

export default function Swap() {
  const t = useContext(I18nContext);
  const history = useHistory();
  const dispatch = useDispatch();

  const { pathname } = useLocation();
  const isAwaitingSwapRoute = pathname === AWAITING_SWAP_ROUTE;
  const isAwaitingSignaturesRoute = pathname === AWAITING_SIGNATURES_ROUTE;
  const isSwapsErrorRoute = pathname === SWAPS_ERROR_ROUTE;
  const isLoadingQuotesRoute = pathname === LOADING_QUOTES_ROUTE;

  const fetchParams = useSelector(getFetchParams, isEqual);
  const { destinationTokenInfo = {} } = fetchParams?.metaData || {};

  const routeState = useSelector(getBackgroundSwapRouteState, shallowEqual);
  const selectedAccount = useSelector(getSelectedAccount, shallowEqual);
  const quotes = useSelector(getQuotes, isEqual);
  const txList = useSelector(currentNetworkTxListSelector, shallowEqual);
  const tradeTxId = useSelector(getTradeTxId);
  const approveTxId = useSelector(getApproveTxId);
  const aggregatorMetadata = useSelector(getAggregatorMetadata, shallowEqual);
  const fetchingQuotes = useSelector(getFetchingQuotes);
  let swapsErrorKey = useSelector(getSwapsErrorKey);
  const swapsEnabled = useSelector(getSwapsFeatureIsLive);
  const chainId = useSelector(getCurrentChainId);
  const isSwapsChain = useSelector(getIsSwapsChain);
  const networkAndAccountSupports1559 = useSelector(
    checkNetworkAndAccountSupports1559,
  );
  const tokenList = useSelector(getTokenList, isEqual);
  const listTokenValues = shuffle(Object.values(tokenList));
  const reviewSwapClickedTimestamp = useSelector(getReviewSwapClickedTimestamp);
  const reviewSwapClicked = Boolean(reviewSwapClickedTimestamp);

  if (networkAndAccountSupports1559) {
    // This will pre-load gas fees before going to the View Quote page.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGasFeeEstimates();
  }

  const {
    balance: ethBalance,
    address: selectedAccountAddress,
  } = selectedAccount;

  const { destinationTokenAddedForSwap } = fetchParams || {};

  const approveTxData =
    approveTxId && txList.find(({ id }) => approveTxId === id);
  const tradeTxData = tradeTxId && txList.find(({ id }) => tradeTxId === id);
  const tokensReceived =
    tradeTxData?.txReceipt &&
    getSwapsTokensReceivedFromTxMeta(
      destinationTokenInfo?.symbol,
      tradeTxData,
      destinationTokenInfo?.address,
      selectedAccountAddress,
      destinationTokenInfo?.decimals,
      approveTxData,
      chainId,
    );
  const tradeConfirmed = tradeTxData?.status === TRANSACTION_STATUSES.CONFIRMED;
  const approveError =
    approveTxData?.status === TRANSACTION_STATUSES.FAILED ||
    approveTxData?.txReceipt?.status === '0x0';
  const tradeError =
    tradeTxData?.status === TRANSACTION_STATUSES.FAILED ||
    tradeTxData?.txReceipt?.status === '0x0';
  const conversionError = approveError || tradeError;

  if (conversionError && swapsErrorKey !== CONTRACT_DATA_DISABLED_ERROR) {
    swapsErrorKey = SWAP_FAILED_ERROR;
  }

  const clearTemporaryTokenRef = useRef();
  useEffect(() => {
    clearTemporaryTokenRef.current = () => {
      if (
        destinationTokenAddedForSwap &&
        (!isAwaitingSwapRoute || conversionError)
      ) {
        dispatch(removeToken(destinationTokenInfo?.address));
      }
    };
  }, [
    conversionError,
    dispatch,
    destinationTokenAddedForSwap,
    destinationTokenInfo,
    fetchParams,
    isAwaitingSwapRoute,
  ]);
  useEffect(() => {
    return () => {
      clearTemporaryTokenRef.current();
    };
  }, []);

  // eslint-disable-next-line
  useEffect(() => {
    fetchTokens(chainId)
      .then((tokens) => {
        dispatch(setSwapsTokens(tokens));
      })
      .catch((error) => console.error(error));
    fetchTopAssets(chainId).then((topAssets) => {
      dispatch(setTopAssets(topAssets));
    });
    fetchAggregatorMetadata(chainId).then((newAggregatorMetadata) => {
      dispatch(setAggregatorMetadata(newAggregatorMetadata));
    });
    if (!networkAndAccountSupports1559) {
      dispatch(fetchAndSetSwapsGasPriceInfo(chainId));
    }
    return () => {
      dispatch(prepareToLeaveSwaps());
    };
  }, [dispatch, chainId, networkAndAccountSupports1559]);

  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const exitedSwapsEvent = useNewMetricEvent({
    event: 'Exited Swaps',
    category: 'swaps',
    sensitiveProperties: {
      token_from: fetchParams?.sourceTokenInfo?.symbol,
      token_from_amount: fetchParams?.value,
      request_type: fetchParams?.balanceError,
      token_to: fetchParams?.destinationTokenInfo?.symbol,
      slippage: fetchParams?.slippage,
      custom_slippage: fetchParams?.slippage !== 2,
      current_screen: pathname.match(/\/swaps\/(.+)/u)[1],
      is_hardware_wallet: hardwareWalletUsed,
      hardware_wallet_type: hardwareWalletType,
    },
  });
  const exitEventRef = useRef();
  useEffect(() => {
    exitEventRef.current = () => {
      exitedSwapsEvent();
    };
  });

  useEffect(() => {
    const fetchSwapsLivenessWrapper = async () => {
      await dispatch(fetchSwapsLiveness());
    };
    fetchSwapsLivenessWrapper();
    return () => {
      exitEventRef.current();
    };
  }, [dispatch]);

  useEffect(() => {
    // If there is a swapsErrorKey and reviewSwapClicked is false, there was an error in silent quotes prefetching
    // and we don't want to show the error page in that case, because another API call for quotes can be successful.
    if (swapsErrorKey && !isSwapsErrorRoute && reviewSwapClicked) {
      history.push(SWAPS_ERROR_ROUTE);
    }
  }, [history, swapsErrorKey, isSwapsErrorRoute, reviewSwapClicked]);

  const beforeUnloadEventAddedRef = useRef();
  useEffect(() => {
    const fn = () => {
      clearTemporaryTokenRef.current();
      if (isLoadingQuotesRoute) {
        dispatch(prepareToLeaveSwaps());
      }
      return null;
    };
    if (isLoadingQuotesRoute && !beforeUnloadEventAddedRef.current) {
      beforeUnloadEventAddedRef.current = true;
      window.addEventListener('beforeunload', fn);
    }
    return () => window.removeEventListener('beforeunload', fn);
  }, [dispatch, isLoadingQuotesRoute]);

  if (!isSwapsChain) {
    return <Redirect to={{ pathname: DEFAULT_ROUTE }} />;
  }

  return (
    <div className="swaps">
      <div className="swaps__container">
        <div className="swaps__header">
          <div className="swaps__title">{t('swap')}</div>
          {!isAwaitingSwapRoute && !isAwaitingSignaturesRoute && (
            <div
              className="swaps__header-cancel"
              onClick={async () => {
                clearTemporaryTokenRef.current();
                dispatch(clearSwapsState());
                await dispatch(resetBackgroundSwapsState());
                history.push(DEFAULT_ROUTE);
              }}
            >
              {t('cancel')}
            </div>
          )}
        </div>
        <div className="swaps__content">
          <Switch>
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={swapsEnabled}
              path={BUILD_QUOTE_ROUTE}
              exact
              render={() => {
                if (tradeTxData && !conversionError) {
                  return <Redirect to={{ pathname: AWAITING_SWAP_ROUTE }} />;
                } else if (tradeTxData && routeState) {
                  return <Redirect to={{ pathname: SWAPS_ERROR_ROUTE }} />;
                } else if (routeState === 'loading' && aggregatorMetadata) {
                  return <Redirect to={{ pathname: LOADING_QUOTES_ROUTE }} />;
                }

                return (
                  <BuildQuote
                    ethBalance={ethBalance}
                    selectedAccountAddress={selectedAccountAddress}
                    shuffledTokensList={listTokenValues}
                  />
                );
              }}
            />
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={swapsEnabled}
              path={VIEW_QUOTE_ROUTE}
              exact
              render={() => {
                if (Object.values(quotes).length) {
                  return (
                    <ViewQuote numberOfQuotes={Object.values(quotes).length} />
                  );
                } else if (fetchParams) {
                  return <Redirect to={{ pathname: SWAPS_ERROR_ROUTE }} />;
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <Route
              path={SWAPS_ERROR_ROUTE}
              exact
              render={() => {
                if (swapsErrorKey) {
                  return (
                    <AwaitingSwap
                      swapComplete={false}
                      errorKey={swapsErrorKey}
                      txHash={tradeTxData?.hash}
                      submittedTime={tradeTxData?.submittedTime}
                    />
                  );
                }
                return <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />;
              }}
            />
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={swapsEnabled}
              path={LOADING_QUOTES_ROUTE}
              exact
              render={() => {
                return aggregatorMetadata ? (
                  <LoadingQuote
                    loadingComplete={
                      !fetchingQuotes && Boolean(Object.values(quotes).length)
                    }
                    onDone={async () => {
                      await dispatch(setBackgroundSwapRouteState(''));
                      if (
                        swapsErrorKey === ERROR_FETCHING_QUOTES ||
                        swapsErrorKey === QUOTES_NOT_AVAILABLE_ERROR
                      ) {
                        dispatch(setSwapsErrorKey(QUOTES_NOT_AVAILABLE_ERROR));
                        history.push(SWAPS_ERROR_ROUTE);
                      } else {
                        history.push(VIEW_QUOTE_ROUTE);
                      }
                    }}
                    aggregatorMetadata={aggregatorMetadata}
                  />
                ) : (
                  <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />
                );
              }}
            />
            <Route
              path={SWAPS_MAINTENANCE_ROUTE}
              exact
              render={() => {
                return swapsEnabled === false ? (
                  <AwaitingSwap errorKey={OFFLINE_FOR_MAINTENANCE} />
                ) : (
                  <Redirect to={{ pathname: BUILD_QUOTE_ROUTE }} />
                );
              }}
            />
            <Route
              path={AWAITING_SIGNATURES_ROUTE}
              exact
              render={() => {
                return <AwaitingSignatures />;
              }}
            />
            <Route
              path={AWAITING_SWAP_ROUTE}
              exact
              render={() => {
                return routeState === 'awaiting' || tradeTxData ? (
                  <AwaitingSwap
                    swapComplete={tradeConfirmed}
                    txHash={tradeTxData?.hash}
                    tokensReceived={tokensReceived}
                    submittingSwap={
                      routeState === 'awaiting' && !(approveTxId || tradeTxId)
                    }
                  />
                ) : (
                  <Redirect to={{ pathname: DEFAULT_ROUTE }} />
                );
              }}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
}
