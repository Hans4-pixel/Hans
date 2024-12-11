import React, { useContext, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';

import {
  isHardwareWallet,
  getHardwareWalletType,
} from '../../../selectors/selectors';
import PulseLoader from '../../../components/ui/pulse-loader';
import {
  TextVariant,
  JustifyContent,
  TextColor,
  BlockSize,
  Display,
} from '../../../helpers/constants/design-system';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { MetaMetricsEventCategory } from '../../../../shared/constants/metametrics';
import { Box, Text } from '../../../components/component-library';
import {
  getBridgeQuotes,
  getFromChain,
  getFromToken,
  getToToken,
  getToChain,
} from '../../../ducks/bridge/selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import BridgeStepIcon from './bridge-step-icon';

export default function AwaitingSignatures() {
  const t = useI18nContext();
  const { activeQuote } = useSelector(getBridgeQuotes, shallowEqual);
  const fromAmount = activeQuote?.sentAmount?.amount?.toNumber();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromChain = useSelector(getFromChain, isEqual);
  const toChain = useSelector(getToChain, isEqual);
  const hardwareWalletUsed = useSelector(isHardwareWallet);
  const hardwareWalletType = useSelector(getHardwareWalletType);
  const needsTwoConfirmations = Boolean(activeQuote?.approval);
  const trackEvent = useContext(MetaMetricsContext);

  useEffect(() => {
    trackEvent({
      event: 'Awaiting Signature(s) on a HW wallet',
      category: MetaMetricsEventCategory.Swaps,
      sensitiveProperties: {
        needs_two_confirmations: needsTwoConfirmations,
        token_from: fromToken?.symbol ?? '',
        token_from_amount: activeQuote?.quote?.srcTokenAmount ?? '',
        token_to: toToken?.symbol ?? '',
        token_to_amount: activeQuote?.quote?.destTokenAmount ?? '',
        is_hardware_wallet: hardwareWalletUsed,
        hardware_wallet_type: hardwareWalletType ?? '',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="awaiting-bridge-signatures">
      <Box
        paddingLeft={6}
        paddingRight={6}
        height={BlockSize.Full}
        justifyContent={JustifyContent.center}
        display={Display.Flex}
      >
        <Box marginTop={3} marginBottom={4}>
          <PulseLoader />
        </Box>
        {!needsTwoConfirmations && (
          <Text
            color={TextColor.textDefault}
            variant={TextVariant.headingMd}
            as="h3"
          >
            {t('swapConfirmWithHwWallet')}
          </Text>
        )}
        {needsTwoConfirmations && (
          <>
            <Text variant={TextVariant.bodyMdBold} marginTop={2}>
              {t('bridgeConfirmTwoTransactions')}
            </Text>
            <ul className="awaiting-bridge-signatures__steps">
              <li>
                <BridgeStepIcon stepNumber={1} />
                {t('bridgeAllowSwappingOf', [
                  <Text
                    as="span"
                    variant={TextVariant.bodyMd}
                    key="allowAmount"
                  >
                    {fromAmount}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="allowToken">
                    {fromToken?.symbol}
                  </Text>,
                  <Text
                    as="span"
                    variant={TextVariant.bodyMd}
                    key="allowNetwork"
                  >
                    {fromChain?.name}
                  </Text>,
                ])}
              </li>
              <li>
                <BridgeStepIcon stepNumber={2} />
                {t('bridgeFromTo', [
                  <Text as="span" variant={TextVariant.bodyMd} key="fromAmount">
                    {fromAmount}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="fromToken">
                    {fromToken?.symbol}
                  </Text>,
                  <Text as="span" variant={TextVariant.bodyMd} key="toNetwork">
                    {toChain?.name}
                  </Text>,
                ])}
              </li>
            </ul>
            <Text variant={TextVariant.bodyXs}>{t('bridgeGasFeesSplit')}</Text>
          </>
        )}
      </Box>
    </div>
  );
}
