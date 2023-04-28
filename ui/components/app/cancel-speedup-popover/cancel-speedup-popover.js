import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { Text } from '../../component-library';
import { EditGasModes, PriorityLevels } from '../../../../shared/constants/gas';
import {
  AlignItems,
  DISPLAY,
  FLEX_DIRECTION,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { getAppIsLoading } from '../../../selectors';
import { gasEstimateGreaterThanGasUsedPlusTenPercent } from '../../../helpers/utils/gas';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTransactionModalContext } from '../../../contexts/transaction-modal';
import EditGasFeeButton from '../edit-gas-fee-button';
import GasDetailsItem from '../gas-details-item';
import Box from '../../ui/box';
import InfoTooltip from '../../ui/info-tooltip';
import Popover from '../../ui/popover';
import AppLoadingSpinner from '../app-loading-spinner';
import { Text, Button, ButtonLink } from '../../component-library';

const CancelSpeedupPopover = () => {
  const {
    cancelTransaction,
    editGasMode,
    gasFeeEstimates,
    speedUpTransaction,
    transaction,
    updateTransaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingEstimate,
  } = useGasFeeContext();
  const t = useI18nContext();
  const { closeModal, currentModal } = useTransactionModalContext();
  const appIsLoading = useSelector(getAppIsLoading);

  useEffect(() => {
    if (
      transaction.previousGas ||
      appIsLoading ||
      currentModal !== 'cancelSpeedUpTransaction'
    ) {
      return;
    }
    // If gas used previously + 10% is less than medium estimated gas
    // estimate is set to medium, else estimate is set to tenPercentIncreased
    const gasUsedLessThanMedium =
      gasFeeEstimates &&
      gasEstimateGreaterThanGasUsedPlusTenPercent(
        transaction.txParams,
        gasFeeEstimates,
        PriorityLevels.medium,
      );
    if (gasUsedLessThanMedium) {
      updateTransactionUsingEstimate(PriorityLevels.medium);
      return;
    }
    updateTransactionToTenPercentIncreasedGasFee(true);
  }, [
    appIsLoading,
    currentModal,
    editGasMode,
    gasFeeEstimates,
    transaction,
    updateTransaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingEstimate,
  ]);

  if (currentModal !== 'cancelSpeedUpTransaction') {
    return null;
  }

  const submitTransactionChange = () => {
    if (editGasMode === EditGasModes.cancel) {
      cancelTransaction();
    } else {
      speedUpTransaction();
    }
    closeModal(['cancelSpeedUpTransaction']);
  };

  return (
    <Popover
      title={
        <>
          {editGasMode === EditGasModes.cancel
            ? `❌${t('cancel')}`
            : `🚀${t('speedUp')}`}
        </>
      }
      onClose={() => closeModal(['cancelSpeedUpTransaction'])}
      className="cancel-speedup-popover"
    >
      <AppLoadingSpinner className="cancel-speedup-popover__spinner" />
      <div className="cancel-speedup-popover__wrapper">
        <Text
          alignItems={AlignItems.center}
          display={DISPLAY.FLEX}
          variant={TextVariant.bodySm}
          marginBottom={4}
          className="cancel-speedup-popover__description"
        >
          {t('cancelSpeedUpLabel', [
            <Text
              as="strong"
              variant={TextVariant.bodySm}
              key="cancelSpeedupCancel"
            >
              {t('replace')}
            </Text>,
          ])}
          <InfoTooltip
            position="top"
            contentText={
              <>
                <Text>
                  {t('cancelSpeedUpTransactionTooltip', [
                    editGasMode === EditGasModes.cancel
                      ? t('cancel')
                      : t('speedUp'),
                  ])}
                </Text>
                <ButtonLink
                  href="https://community.metamask.io/t/how-to-speed-up-or-cancel-transactions-on-metamask/3296"
                  target="_blank"
                >
                  {t('learnMoreUpperCase')}
                </ButtonLink>
              </>
            }
          />
        </Text>
        <Box
          display={DISPLAY.FLEX}
          alignItems={AlignItems.center}
          flexDirection={FLEX_DIRECTION.COLUMN}
          marginTop={4}
        >
          <Box className="cancel-speedup-popover__edit-gas-button">
            {!appIsLoading && <EditGasFeeButton />}
          </Box>
          <Box className="cancel-speedup-popover__gas-details">
            <GasDetailsItem />
          </Box>
        </Box>
        <Button onClick={submitTransactionChange}>{t('submit')}</Button>
      </div>
    </Popover>
  );
};

export default CancelSpeedupPopover;
