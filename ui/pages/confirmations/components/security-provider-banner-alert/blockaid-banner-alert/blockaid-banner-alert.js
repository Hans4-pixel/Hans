import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '@sentry/browser';
import BlockaidPackage from '@blockaid/ppom_release/package.json';

import { NETWORK_TO_NAME_MAP } from '../../../../../../shared/constants/network';
import {
  AlignItems,
  BorderColor,
  BorderRadius,
  Display,
  IconColor,
  JustifyContent,
  OverflowWrap,
  Severity,
  TextColor,
} from '../../../../../helpers/constants/design-system';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  BlockaidReason,
  BlockaidResultType,
  SecurityProvider,
} from '../../../../../../shared/constants/security-provider';
import {
  Box,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../../../../components/component-library';
import Spinner from '../../../../../components/ui/spinner';
import { useTransactionEventFragment } from '../../../hooks/useTransactionEventFragment';

import SecurityProviderBannerAlert from '../security-provider-banner-alert';
import { getReportUrl } from './blockaid-banner-utils';

const zlib = require('zlib');

/** Reason to description translation key mapping. Grouped by translations. */
const REASON_TO_DESCRIPTION_TKEY = Object.freeze({
  [BlockaidReason.approvalFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.permitFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.setApprovalForAll]: 'blockaidDescriptionApproveFarming',

  [BlockaidReason.blurFarming]: 'blockaidDescriptionBlurFarming',

  [BlockaidReason.errored]: 'blockaidDescriptionErrored', // TODO: change in i8n

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
  [BlockaidReason.errored]: 'blockaidTitleMayNotBeSafe',
  [BlockaidReason.rawSignatureFarming]: 'blockaidTitleSuspicious',
});

function BlockaidBannerAlert({ txData, ...props }) {
  const { securityAlertResponse, origin, msgParams, type, txParams, chainId } =
    txData;

  const t = useContext(I18nContext);
  const { updateTransactionEventFragment } = useTransactionEventFragment();
  const [hasDisplayedLoading, sethasDisplayedLoading] = useState(false);

  useEffect(() => {
    if (securityAlertResponse?.reason === 'loading') {
      sethasDisplayedLoading(true);
    }
  }, [securityAlertResponse]);

  if (
    !securityAlertResponse ||
    Object.keys(securityAlertResponse).length === 0
  ) {
    return null;
  } else if (securityAlertResponse.reason === 'loading') {
    return (
      <Box
        alignItems={AlignItems.center}
        borderColor={BorderColor.borderMuted}
        borderRadius={BorderRadius.SM}
        className="blockaid_banner__wrapper"
        display={Display.Flex}
        margin={props.margin}
        marginLeft={props.marginLeft}
        marginRight={props.marginRight}
        padding={2}
      >
        <Spinner
          className="blockaid_banner__spinner"
          color={BorderColor.borderMuted}
        />
        <Text color={TextColor.textDefault} marginLeft={2}>
          {t('blockaidAlertLoading')}
        </Text>
      </Box>
    );
  }

  const {
    block,
    features,
    reason,
    result_type: resultType,
  } = securityAlertResponse;

  if (resultType === BlockaidResultType.Benign) {
    if (hasDisplayedLoading) {
      return (
        <Box
          alignItems={AlignItems.center}
          borderColor={BorderColor.borderMuted}
          borderRadius={BorderRadius.SM}
          className="blockaid_banner__wrapper"
          display={Display.Flex}
          margin={props.margin}
          marginLeft={props.marginLeft}
          marginRight={props.marginRight}
          padding={2}
        >
          <Box
            alignItems={AlignItems.center}
            backgroundColor={TextColor.textDefault}
            borderRadius={BorderRadius.full}
            className="blockaid_banner__icon_wrapper"
            display={Display.Flex}
            justifyContent={JustifyContent.center}
          >
            <Icon
              name={IconName.Check}
              color={IconColor.primaryInverse}
              size={IconSize.Sm}
            />
          </Box>
          <Text color={TextColor.textDefault} marginLeft={2}>
            {t('blockaidNoAlerts')}
          </Text>
        </Box>
      );
    }
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

  const isFailedResultType = resultType === BlockaidResultType.Errored;

  const severity =
    resultType === BlockaidResultType.Malicious
      ? Severity.Danger
      : Severity.Warning;

  const title = t(REASON_TO_TITLE_TKEY[reason] || 'blockaidTitleDeceptive');

  /** Data we pass to Blockaid false reporting portal. As far as I know, there are no documents that exist that specifies these key values */
  const reportUrl = (() => {
    const reportData = {
      blockNumber: block,
      blockaidVersion: BlockaidPackage.version,
      chain: NETWORK_TO_NAME_MAP[chainId],
      classification: isFailedResultType ? 'error' : reason,
      domain: origin ?? msgParams?.origin ?? txParams?.origin,
      jsonRpcMethod: type,
      jsonRpcParams: JSON.stringify(txParams ?? msgParams),
      resultType: isFailedResultType ? BlockaidResultType.Errored : resultType,
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
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  marginBottom: PropTypes.number,
  margin: PropTypes.number,
};

export default BlockaidBannerAlert;
