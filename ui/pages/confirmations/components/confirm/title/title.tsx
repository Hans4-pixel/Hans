import {
  TransactionMeta,
  TransactionType,
} from '@metamask/transaction-controller';
import React, { memo, useMemo } from 'react';

import GeneralAlert from '../../../../../components/app/alert-system/general-alert/general-alert';
import { Box, Text } from '../../../../../components/component-library';
import {
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import useAlerts from '../../../../../hooks/useAlerts';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { useConfirmContext } from '../../../context/confirm';
import { Confirmation, SignatureRequestType } from '../../../types/confirm';
import {
  isPermitSignatureRequest,
  isSIWESignatureRequest,
} from '../../../utils';
import { useIsNFT } from '../info/approve/hooks/use-is-nft';
import { useDecodedTransactionData } from '../info/hooks/useDecodedTransactionData';
import { getIsRevokeSetApprovalForAll } from '../info/utils';

function ConfirmBannerAlert({ ownerId }: { ownerId: string }) {
  const { generalAlerts } = useAlerts(ownerId);

  if (generalAlerts.length === 0) {
    return null;
  }

  return (
    <Box marginTop={3}>
      {generalAlerts.map((alert) => (
        <Box marginTop={1} key={alert.key}>
          <GeneralAlert
            data-testid="confirm-banner-alert"
            title={alert.reason}
            description={alert.message}
            severity={alert.severity}
            provider={alert.provider}
            details={alert.alertDetails}
            reportUrl={alert.reportUrl}
          />
        </Box>
      ))}
    </Box>
  );
}

type IntlFunction = (str: string) => string;

const getTitle = (
  t: IntlFunction,
  confirmation?: Confirmation,
  isNFT?: boolean,
  isRevokeSetApprovalForAll?: boolean,
) => {
  switch (confirmation?.type) {
    case TransactionType.contractInteraction:
      return t('confirmTitleTransaction');
    case TransactionType.deployContract:
      return t('confirmTitleDeployContract');
    case TransactionType.personalSign:
      if (isSIWESignatureRequest(confirmation as SignatureRequestType)) {
        return t('confirmTitleSIWESignature');
      }
      return t('confirmTitleSignature');
    case TransactionType.signTypedData:
      return isPermitSignatureRequest(confirmation as SignatureRequestType)
        ? t('confirmTitlePermitTokens')
        : t('confirmTitleSignature');
    case TransactionType.tokenMethodApprove:
      if (isNFT) {
        return t('confirmTitleApproveTransaction');
      }
      return t('confirmTitlePermitTokens');
    case TransactionType.tokenMethodIncreaseAllowance:
      return t('confirmTitlePermitTokens');
    case TransactionType.tokenMethodSetApprovalForAll:
      if (isRevokeSetApprovalForAll) {
        return t('confirmTitleSetApprovalForAllRevokeTransaction');
      }
      return t('setApprovalForAllRedesignedTitle');
    default:
      return '';
  }
};

const getDescription = (
  t: IntlFunction,
  confirmation?: Confirmation,
  isNFT?: boolean,
  isRevokeSetApprovalForAll?: boolean,
) => {
  switch (confirmation?.type) {
    case TransactionType.contractInteraction:
      return '';
    case TransactionType.deployContract:
      return t('confirmTitleDescDeployContract');
    case TransactionType.personalSign:
      if (isSIWESignatureRequest(confirmation as SignatureRequestType)) {
        return t('confirmTitleDescSIWESignature');
      }
      return t('confirmTitleDescSign');
    case TransactionType.signTypedData:
      return isPermitSignatureRequest(confirmation as SignatureRequestType)
        ? t('confirmTitleDescPermitSignature')
        : t('confirmTitleDescSign');
    case TransactionType.tokenMethodApprove:
      if (isNFT) {
        return t('confirmTitleDescApproveTransaction');
      }
      return t('confirmTitleDescERC20ApproveTransaction');
    case TransactionType.tokenMethodIncreaseAllowance:
      return t('confirmTitleDescPermitSignature');
    case TransactionType.tokenMethodSetApprovalForAll:
      if (isRevokeSetApprovalForAll) {
        return '';
      }
      return t('confirmTitleDescApproveTransaction');

    default:
      return '';
  }
};

const ConfirmTitle: React.FC = memo(() => {
  const t = useI18nContext();
  const { currentConfirmation } = useConfirmContext();

  const { isNFT } = useIsNFT(currentConfirmation as TransactionMeta);

  let isRevokeSetApprovalForAll = false;
  if (
    currentConfirmation?.type === TransactionType.tokenMethodSetApprovalForAll
  ) {
    const decodedResponse = useDecodedTransactionData();

    isRevokeSetApprovalForAll = getIsRevokeSetApprovalForAll(
      decodedResponse.value,
    );
  }

  const title = useMemo(
    () =>
      getTitle(
        t as IntlFunction,
        currentConfirmation,
        isNFT,
        isRevokeSetApprovalForAll,
      ),
    [currentConfirmation, isNFT, isRevokeSetApprovalForAll],
  );

  const description = useMemo(
    () =>
      getDescription(
        t as IntlFunction,
        currentConfirmation,
        isNFT,
        isRevokeSetApprovalForAll,
      ),
    [currentConfirmation, isNFT, isRevokeSetApprovalForAll],
  );

  if (!currentConfirmation) {
    return null;
  }

  return (
    <>
      <ConfirmBannerAlert ownerId={currentConfirmation.id} />
      <Text
        variant={TextVariant.headingLg}
        paddingTop={4}
        paddingBottom={2}
        textAlign={TextAlign.Center}
      >
        {title}
      </Text>
      <Text
        paddingBottom={4}
        color={TextColor.textAlternative}
        textAlign={TextAlign.Center}
      >
        {description}
      </Text>
    </>
  );
});

export default ConfirmTitle;
