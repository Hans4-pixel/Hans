import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '@sentry/browser';
import BlockaidPackage from '@blockaid/ppom_release/package.json';

import { NETWORK_TO_NAME_MAP } from '../../../../../shared/constants/network';
import {
  OverflowWrap,
  Severity,
} from '../../../../helpers/constants/design-system';
import { I18nContext } from '../../../../contexts/i18n';
import { useTransactionEventFragment } from '../../../../hooks/useTransactionEventFragment';
import {
  BlockaidReason,
  BlockaidResultType,
  SecurityProvider,
} from '../../../../../shared/constants/security-provider';
import { Text } from '../../../component-library';

import SecurityProviderBannerAlert from '../security-provider-banner-alert';
import LoadingIndicator from '../../../ui/loading-indicator';
import { getReportUrl } from './blockaid-banner-utils';

const zlib = require('zlib');

/** Reason to description translation key mapping. Grouped by translations. */
const REASON_TO_DESCRIPTION_TKEY = Object.freeze({
  [BlockaidReason.approvalFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.permitFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.setApprovalForAll]: 'blockaidDescriptionApproveFarming',

  [BlockaidReason.blurFarming]: 'blockaidDescriptionBlurFarming',

  [BlockaidReason.failed]: 'blockaidDescriptionFailed',

  [BlockaidReason.seaportFarming]: 'blockaidDescriptionSeaportFarming',

  [BlockaidReason.maliciousDomain]: 'blockaidDescriptionMaliciousDomain',

  [BlockaidReason.rawSignatureFarming]: 'blockaidDescriptionMightLoseAssets',
  [BlockaidReason.tradeOrderFarming]: 'blockaidDescriptionMightLoseAssets',

  [BlockaidReason.rawNativeTokenTransfer]: 'blockaidDescriptionTransferFarming',
  [BlockaidReason.transferFarming]: 'blockaidDescriptionTransferFarming',
  [BlockaidReason.transferFromFarming]: 'blockaidDescriptionTransferFarming',

  [BlockaidReason.other]: 'blockaidDescriptionMightLoseAssets',
});

/** Reason to title translation key mapping. */
const REASON_TO_TITLE_TKEY = Object.freeze({
  [BlockaidReason.failed]: 'blockaidTitleMayNotBeSafe',
  [BlockaidReason.rawSignatureFarming]: 'blockaidTitleSuspicious',
});

function BlockaidBannerAlert({ txData, ...props }) {
  const { securityAlertResponse, origin, msgParams, type, txParams, chainId } =
    txData;

  const t = useContext(I18nContext);
  const { updateTransactionEventFragment } = useTransactionEventFragment();

  if (
    !securityAlertResponse ||
    Object.keys(securityAlertResponse).length === 0
  ) {
    return null;
  } else if (securityAlertResponse.reason === 'loading') {
    return <LoadingIndicator isLoading />;
  }

  const {
    block,
    features,
    reason,
    result_type: resultType,
  } = securityAlertResponse;

  if (resultType === BlockaidResultType.Benign) {
    return null;
  }

  if (!REASON_TO_DESCRIPTION_TKEY[reason]) {
    captureException(`BlockaidBannerAlert: Unidentified reason '${reason}'`);
  }

  const description = t(
    REASON_TO_DESCRIPTION_TKEY[reason] || REASON_TO_DESCRIPTION_TKEY.other,
  );

  const details = features?.length ? (
    <Text as="ul" overflowWrap={OverflowWrap.BreakWord}>
      {features.map((feature, i) => (
        <li key={`blockaid-detail-${i}`}>• {feature}</li>
      ))}
    </Text>
  ) : null;

  const severity =
    resultType === BlockaidResultType.Malicious
      ? Severity.Danger
      : Severity.Warning;

  const title = t(REASON_TO_TITLE_TKEY[reason] || 'blockaidTitleDeceptive');

  const reportUrl = (() => {
    const reportData = {
      blockNumber: block,
      blockaidVersion: BlockaidPackage.version,
      chain: NETWORK_TO_NAME_MAP[chainId],
      classification: reason,
      domain: origin ?? msgParams?.origin ?? txParams?.origin,
      jsonRpcMethod: type,
      jsonRpcParams: JSON.stringify(txParams ?? msgParams),
      resultType,
      reproduce: JSON.stringify(features),
    };

    const jsonData = JSON.stringify(reportData);

    const encodedData = zlib?.gzipSync?.(jsonData) ?? jsonData;

    return getReportUrl(encodedData);
  })();

  const onClickSupportLink = () => {
    updateTransactionEventFragment(
      {
        properties: {
          external_link_clicked: 'security_alert_support_link',
        },
      },
      txData.id,
    );
  };

  return (
    <SecurityProviderBannerAlert
      description={description}
      details={details}
      provider={SecurityProvider.Blockaid}
      reportUrl={reportUrl}
      severity={severity}
      title={title}
      onClickSupportLink={onClickSupportLink}
      {...props}
    />
  );
}

BlockaidBannerAlert.propTypes = {
  txData: PropTypes.object,
};

export default BlockaidBannerAlert;
