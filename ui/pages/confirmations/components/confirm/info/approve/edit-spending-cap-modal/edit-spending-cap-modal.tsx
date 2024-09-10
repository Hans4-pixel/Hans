import { TransactionMeta } from '@metamask/transaction-controller';
import { BigNumber } from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hexToDecimal } from '../../../../../../../../shared/modules/conversion.utils';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  TextField,
  TextFieldType,
} from '../../../../../../../components/component-library';
import {
  AlignItems,
  Display,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../../../../hooks/useI18nContext';
import { updateEditableParams } from '../../../../../../../store/actions';
import { getCustomTxParamsData } from '../../../../../confirm-approve/confirm-approve.util';
import { useConfirmContext } from '../../../../../context/confirm';
import { useAssetDetails } from '../../../../../hooks/useAssetDetails';
import { useApproveTokenSimulation } from '../hooks/use-approve-token-simulation';
import { useTransactionGasEstimate } from '../hooks/use-transaction-gas-estimate';

export const getAccountBalance = (userBalance: string, decimals: string) =>
  new BigNumber(userBalance)
    .dividedBy(new BigNumber(10).pow(Number(decimals)))
    .toNumber();

export const EditSpendingCapModal = ({
  isOpenEditSpendingCapModal,
  setIsOpenEditSpendingCapModal,
}: {
  isOpenEditSpendingCapModal: boolean;
  setIsOpenEditSpendingCapModal: (newValue: boolean) => void;
}) => {
  const t = useI18nContext();

  const dispatch = useDispatch();

  const { currentConfirmation: transactionMeta } = useConfirmContext() as {
    currentConfirmation: TransactionMeta;
  };

  const { userBalance, tokenSymbol, decimals } = useAssetDetails(
    transactionMeta.txParams.to,
    transactionMeta.txParams.from,
    transactionMeta.txParams.data,
  );

  const accountBalance = getAccountBalance(userBalance || '0', decimals || '0');

  const { formattedSpendingCap } = useApproveTokenSimulation(
    transactionMeta,
    decimals || '0',
  );

  const [customSpendingCapInputValue, setCustomSpendingCapInputValue] =
    useState('');
  const [customSpendingCap, setCustomSpendingCap] = useState('');
  const setPositiveSpendingCap = (newValue: string) => {
    const parsedValue = parseInt(newValue, 10);
    // coerce negative numbers to zero
    setCustomSpendingCap(parsedValue < 0 ? '0' : newValue);
  };

  const customTxParamsData = useMemo(() => {
    return getCustomTxParamsData(transactionMeta?.txParams?.data, {
      customPermissionAmount: customSpendingCap || '0',
      decimals: decimals || '0',
    });
  }, [customSpendingCap, transactionMeta?.txParams?.data, decimals]);

  const { estimatedGasLimit } = useTransactionGasEstimate(
    transactionMeta,
    customTxParamsData,
    customSpendingCap,
  );

  useEffect(() => {
    if (customSpendingCap && estimatedGasLimit) {
      dispatch(
        updateEditableParams(transactionMeta.id, {
          data: customTxParamsData,
          gas: hexToDecimal(estimatedGasLimit as string),
        }),
      );
    }
  }, [
    customSpendingCap,
    estimatedGasLimit,
    customTxParamsData,
    transactionMeta,
    dispatch,
  ]);

  const handleCancel = useCallback(() => {
    setIsOpenEditSpendingCapModal(false);
    setCustomSpendingCapInputValue('');
  }, [setIsOpenEditSpendingCapModal, setCustomSpendingCapInputValue]);

  const handleSubmit = useCallback(() => {
    setIsOpenEditSpendingCapModal(false);
    setPositiveSpendingCap(customSpendingCapInputValue);
    setCustomSpendingCapInputValue('');
  }, [
    setIsOpenEditSpendingCapModal,
    setCustomSpendingCapInputValue,
    setPositiveSpendingCap,
    customSpendingCapInputValue,
  ]);

  return (
    <Modal
      isOpen={isOpenEditSpendingCapModal}
      onClose={() => setIsOpenEditSpendingCapModal(false)}
      isClosedOnEscapeKey
      isClosedOnOutsideClick
      className="edit-spending-cap-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          justifyContent={JustifyContent.center}
          childrenWrapperProps={{
            alignItems: AlignItems.center,
            display: Display.Flex,
            flexDirection: FlexDirection.Column,
          }}
        >
          <Text variant={TextVariant.headingMd}>{t('editSpendingCap')}</Text>
        </ModalHeader>
        <ModalBody>
          <Text
            variant={TextVariant.bodyMd}
            color={TextColor.textAlternative}
            paddingBottom={4}
          >
            {t('editSpendingCapDesc')}
          </Text>
          <TextField
            type={TextFieldType.Number}
            value={customSpendingCapInputValue}
            onChange={(event) =>
              setCustomSpendingCapInputValue(event.target.value)
            }
            placeholder={`${
              customSpendingCap === ''
                ? formattedSpendingCap
                : customSpendingCap
            } ${tokenSymbol}`}
            style={{ width: '100%' }}
            inputProps={{ 'data-testid': 'custom-spending-cap-input' }}
          />
          <Text
            variant={TextVariant.bodySm}
            color={TextColor.textAlternative}
            paddingTop={1}
          >
            {t('editSpendingCapAccountBalance', [
              accountBalance,
              tokenSymbol || '',
            ])}
          </Text>
        </ModalBody>
        <ModalFooter
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonProps={{ children: t('save') }}
        />
      </ModalContent>
    </Modal>
  );
};
