import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ButtonPrimary,
  ButtonPrimarySize,
} from '../../../components/component-library';
import {
  getFromAmount,
  getFromChain,
  getFromToken,
  getToChain,
  getToToken,
  getBridgeQuotes,
  getBridgeFeesPerGas,
} from '../../../ducks/bridge/selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { submitBridgeTransaction } from '../../../ducks/bridge/actions';
import {
  BlockSize,
  TextVariant,
} from '../../../helpers/constants/design-system';

export const BridgeCTAButton = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const t = useI18nContext();
  const fromToken = useSelector(getFromToken);
  const toToken = useSelector(getToToken);

  const fromChain = useSelector(getFromChain);
  const toChain = useSelector(getToChain);

  const fromAmount = useSelector(getFromAmount);

  const { isLoading, activeQuote } = useSelector(getBridgeQuotes);
  const { maxFeePerGas, maxPriorityFeePerGas } =
    useSelector(getBridgeFeesPerGas);

  const isTxSubmittable =
    fromToken && toToken && fromChain && toChain && fromAmount && activeQuote;

  const label = useMemo(() => {
    if (isLoading && !isTxSubmittable) {
      return t('swapFetchingQuotes');
    }

    if (!fromAmount) {
      if (!toToken) {
        return t('bridgeSelectTokenAndAmount');
      }
      return t('bridgeEnterAmount');
    }

    if (isTxSubmittable) {
      return t('confirm');
    }

    return t('swapSelectToken');
  }, [isLoading, fromAmount, toToken, isTxSubmittable]);

  return (
    <ButtonPrimary
      width={BlockSize.Full}
      style={{ flex: 1 }}
      size={activeQuote ? ButtonPrimarySize.Md : ButtonPrimarySize.Lg}
      variant={TextVariant.bodyMd}
      data-testid="bridge-cta-button"
      onClick={() => {
        if (isTxSubmittable) {
          dispatch(
            submitBridgeTransaction(
              activeQuote,
              history,
              maxFeePerGas,
              maxPriorityFeePerGas,
            ),
          );
        }
      }}
      disabled={!isTxSubmittable}
    >
      {label}
    </ButtonPrimary>
  );
};
