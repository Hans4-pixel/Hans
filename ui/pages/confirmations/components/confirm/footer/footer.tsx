import { TransactionMeta } from '@metamask/transaction-controller';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmAlertModal } from '../../../../../components/app/alert-system/confirm-alert-modal';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  IconName,
} from '../../../../../components/component-library';
import { Footer as PageFooter } from '../../../../../components/multichain/pages/page';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import {
  doesAddressRequireLedgerHidConnection,
  getCustomNonceValue,
} from '../../../../../selectors';
///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
import { useMMIConfirmations } from '../../../../../hooks/useMMIConfirmations';
///: END:ONLY_INCLUDE_IF
import useAlerts from '../../../../../hooks/useAlerts';
import {
  rejectPendingApproval,
  resolvePendingApproval,
  updateAndApproveTx,
} from '../../../../../store/actions';
import { confirmSelector } from '../../../selectors';
import { REDESIGN_TRANSACTION_TYPES } from '../../../utils';
import { getConfirmationSender } from '../utils';

const ConfirmButton = ({
  alertOwnerId = '',
  disabled,
  onSubmit,
  onCancel,
}: {
  alertOwnerId?: string;
  disabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  const t = useI18nContext();

  const [confirmModalVisible, setConfirmModalVisible] =
    useState<boolean>(false);

  const { dangerAlerts, hasDangerAlerts, hasUnconfirmedDangerAlerts } =
    useAlerts(alertOwnerId);

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmModalVisible(false);
  }, []);

  const handleOpenConfirmModal = useCallback(() => {
    setConfirmModalVisible(true);
  }, []);

  return (
    <>
      {confirmModalVisible && (
        <ConfirmAlertModal
          ownerId={alertOwnerId}
          onClose={handleCloseConfirmModal}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      )}
      {hasDangerAlerts ? (
        <Button
          block
          danger
          data-testid="confirm-footer-button"
          disabled={hasUnconfirmedDangerAlerts ? false : disabled}
          onClick={handleOpenConfirmModal}
          size={ButtonSize.Lg}
          startIconName={IconName.Danger}
        >
          {dangerAlerts?.length > 1 ? t('reviewAlerts') : t('confirm')}
        </Button>
      ) : (
        <Button
          block
          data-testid="confirm-footer-button"
          disabled={disabled}
          onClick={onSubmit}
          size={ButtonSize.Lg}
        >
          {t('confirm')}
        </Button>
      )}
    </>
  );
};

const Footer = () => {
  const dispatch = useDispatch();
  const t = useI18nContext();
  const confirm = useSelector(confirmSelector);
  const customNonceValue = useSelector(getCustomNonceValue);

  const { currentConfirmation, isScrollToBottomNeeded } = confirm;
  const { from } = getConfirmationSender(currentConfirmation);

  ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
  const { mmiOnSignCallback, mmiSubmitDisabled } = useMMIConfirmations();
  ///: END:ONLY_INCLUDE_IF


  ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
  const mmiApprovalFlow = () => {
    if (accountType === AccountType.CUSTODY) {
      fullTxData.custodyStatus = CustodyStatus.CREATED;
      fullTxData.metadata = fullTxData.metadata || {};

      dispatch(mmiActions.setWaitForConfirmDeepLinkDialog(true));

      const txId = fullTxData.id;
      const fromAddress = fullTxData.txParams.from;
      const closeNotification = false;
      dispatch(updateAndApproveTx(customNonceMerge(fullTxData))).then(() => {
        showCustodianDeepLink({
          dispatch,
          mmiActions,
          txId,
          fromAddress,
          closeNotification,
          onDeepLinkFetched: () => undefined,
          onDeepLinkShown: () => {
            dispatch(clearConfirmTransaction());
            history.push(mostRecentOverviewPage);
          },
          showCustodyConfirmLink,
        });
        history.push(mostRecentOverviewPage);
      });
    } else {
      // Non Custody accounts follow normal flow
      dispatch(updateAndApproveTx(customNonceMerge(fullTxData))).then(() => {
        dispatch(clearConfirmTransaction());
        history.push(mostRecentOverviewPage);
      });
    }
  };
  ///: END:ONLY_INCLUDE_IF

  const hardwareWalletRequiresConnection = useSelector((state) => {
    if (from) {
      return doesAddressRequireLedgerHidConnection(state, from);
    }
    return false;
  });

  const onCancel = useCallback(() => {
    if (!currentConfirmation) {
      return;
    }

    dispatch(
      rejectPendingApproval(
        currentConfirmation.id,
        serializeError(ethErrors.provider.userRejectedRequest()),
      ),
    );
  }, [currentConfirmation]);

  const onSubmit = useCallback(() => {
    if (!currentConfirmation) {
      return;
    }

    const isTransactionConfirmation = REDESIGN_TRANSACTION_TYPES.find(
      (type) => type === currentConfirmation?.type,
    );
    if (isTransactionConfirmation) {
      const mergeTxDataWithNonce = (transactionData: TransactionMeta) =>
        customNonceValue
          ? { ...transactionData, customNonceValue }
          : transactionData;

      const updatedTx = mergeTxDataWithNonce(
        currentConfirmation as TransactionMeta,
      );

      ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
      mmiApprovalFlow();
      ///: END:ONLY_INCLUDE_IF

      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      dispatch(updateAndApproveTx(updatedTx, true, ''));
      ///: END:ONLY_INCLUDE_IF

    } else {
      dispatch(resolvePendingApproval(currentConfirmation.id, undefined));

      ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
      mmiOnSignCallback();
      ///: END:ONLY_INCLUDE_IF
    }
  }, [currentConfirmation, customNonceValue]);

  return (
    <PageFooter className="confirm-footer_page-footer">
      <Button
        block
        data-testid="confirm-footer-cancel-button"
        onClick={onCancel}
        size={ButtonSize.Lg}
        variant={ButtonVariant.Secondary}
      >
        {t('cancel')}
      </Button>
      <ConfirmButton
        alertOwnerId={currentConfirmation?.id}
        onSubmit={() => onSubmit()}
        disabled={
          ///: BEGIN:ONLY_INCLUDE_IF(build-mmi)
          mmiSubmitDisabled ||
          ///: END:ONLY_INCLUDE_IF
          isScrollToBottomNeeded ||
          hardwareWalletRequiresConnection
        }
        onCancel={onCancel}
      />
    </PageFooter>
  );
};

export default Footer;
