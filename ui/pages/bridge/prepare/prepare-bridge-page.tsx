import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setFromChain,
  setFromToken,
  setFromTokenInputValue,
  setToChain,
  setToToken,
  switchToAndFromTokens,
} from '../../../ducks/bridge/actions';
import {
  getFromAmount,
  getFromChain,
  getFromChains,
  getFromToken,
  getFromTokens,
  getFromTopAssets,
  getToAmount,
  getToChain,
  getToChains,
  getToToken,
  getToTokens,
  getToTopAssets,
} from '../../../ducks/bridge/selectors';
import {
  Box,
  ButtonIcon,
  IconName,
} from '../../../components/component-library';
import { BlockSize } from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { TokenBucketPriority } from '../../../../shared/constants/swaps';
import { useTokensWithFiltering } from '../../../hooks/useTokensWithFiltering';
import { setActiveNetwork } from '../../../store/actions';
import { BridgeInputGroup } from './bridge-input-group';

const PrepareBridgePage = () => {
  const dispatch = useDispatch();

  const t = useI18nContext();

  const fromToken = useSelector(getFromToken);
  const fromTokens = useSelector(getFromTokens);
  const fromTopAssets = useSelector(getFromTopAssets);

  const toToken = useSelector(getToToken);
  const toTokens = useSelector(getToTokens);
  const toTopAssets = useSelector(getToTopAssets);

  const fromChains = useSelector(getFromChains);
  const toChains = useSelector(getToChains);
  const fromChain = useSelector(getFromChain);
  const toChain = useSelector(getToChain);

  const fromAmount = useSelector(getFromAmount);
  const toAmount = useSelector(getToAmount);

  const fromTokenListGenerator = useTokensWithFiltering(
    fromTokens,
    fromTopAssets,
    fromChain?.chainId,
    TokenBucketPriority.owned,
  );
  const toTokenListGenerator = useTokensWithFiltering(
    toTokens ?? fromTokens,
    toTopAssets ?? fromTopAssets,
    toChain?.chainId ?? fromChain?.chainId,
    TokenBucketPriority.top,
  );

  return (
    <div className="prepare-bridge-page">
      <Box className="prepare-bridge-page__content">
        <BridgeInputGroup
          className="prepare-bridge-page__from"
          header={t('bridgeFrom')}
          asset={{
            ...fromToken,
            image: 'iconUrl' in fromToken ? fromToken?.iconUrl : null,
          }}
          onAmountChange={(e) => {
            dispatch(setFromTokenInputValue(e));
          }}
          onAssetChange={(token) => dispatch(setFromToken(token))}
          networkProps={{
            network: fromChain,
            networks: fromChains,
            onNetworkChange: (networkConfig) => {
              if (networkConfig.id) {
                dispatch(setActiveNetwork(networkConfig.id));
                dispatch(setFromChain(networkConfig.chainId));
              }
              // TODO emit metric
            },
          }}
          customTokenListGenerator={
            fromTokens && fromTopAssets ? fromTokenListGenerator : undefined
          }
          amountFieldProps={{
            testId: 'from-amount',
            autoFocus: true,
            value: fromAmount,
          }}
        />

        <BridgeInputGroup
          className="prepare-bridge-page__to"
          header={t('bridgeTo')}
          asset={toToken}
          onAssetChange={(token) => dispatch(setToToken(token))}
          networkProps={{
            network: toChain,
            networks: toChains,
            onNetworkChange: (networkConfig) => {
              dispatch(setToChain(networkConfig.chainId));
            },
          }}
          customTokenListGenerator={
            toChain && toTokens && toTopAssets
              ? toTokenListGenerator
              : fromTokenListGenerator
          }
          amountFieldProps={{
            testId: 'to-amount',
            readOnly: true,
            disabled: true,
            value: toAmount,
          }}
        />
      </Box>
    </div>
  );
};

export default PrepareBridgePage;
