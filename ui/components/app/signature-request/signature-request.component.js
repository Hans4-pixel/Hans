import React, { PureComponent } from 'react';
import { memoize } from 'lodash';
import PropTypes from 'prop-types';
import { EVM, IInspectorReturn } from 'signature-inspection';
import { Redirect } from 'react-router-dom';
import LedgerInstructionField from '../ledger-instruction-field';

import {
  sanitizeMessage,
  getURLHostName,
  ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
  shortenAddress,
  ///: END:ONLY_INCLUDE_IN
} from '../../../helpers/utils/util';
import { ASSET_ROUTE } from '../../../helpers/constants/routes';
import { MetaMetricsEventCategory } from '../../../../shared/constants/metametrics';
import SiteOrigin from '../../ui/site-origin';
import Button from '../../ui/button';
import Typography from '../../ui/typography/typography';
import ContractDetailsModal from '../modals/contract-details-modal/contract-details-modal';
import {
  TypographyVariant,
  FONT_WEIGHT,
  TEXT_ALIGN,
  TextColor,
  ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
  IconColor,
  DISPLAY,
  BLOCK_SIZES,
  TextVariant,
  BackgroundColor,
  ///: END:ONLY_INCLUDE_IN
} from '../../../helpers/constants/design-system';
import NetworkAccountBalanceHeader from '../network-account-balance-header';
import { NETWORK_TYPES } from '../../../../shared/constants/network';
import { Numeric } from '../../../../shared/modules/Numeric';
import { EtherDenomination } from '../../../../shared/constants/common';
import ConfirmPageContainerNavigation from '../confirm-page-container/confirm-page-container-navigation';
import SecurityProviderBannerMessage from '../security-provider-banner-message/security-provider-banner-message';
import { SECURITY_PROVIDER_MESSAGE_SEVERITIES } from '../security-provider-banner-message/security-provider-banner-message.constants';
import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { getValueFromWeiHex } from '../../../../shared/modules/conversion.utils';

// eslint-disable-next-line import/no-duplicates
import { BannerAlert } from '../../component-library';
///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
// eslint-disable-next-line import/no-duplicates
import { Icon, IconName, Text } from '../../component-library';

import Box from '../../ui/box/box';
///: END:ONLY_INCLUDE_IN

import Footer from './signature-request-footer';
import Message from './signature-request-message';

export default class SignatureRequest extends PureComponent {
  static propTypes = {
    /**
     * The display content of transaction data
     */
    txData: PropTypes.object.isRequired,
    /**
     * The display content of sender account
     */
    fromAccount: PropTypes.shape({
      address: PropTypes.string.isRequired,
      balance: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
    /**
     * Check if the wallet is ledget wallet or not
     */
    isLedgerWallet: PropTypes.bool,
    /**
     * Handler for cancel button
     */
    cancel: PropTypes.func.isRequired,
    /**
     * Handler for sign button
     */
    sign: PropTypes.func.isRequired,
    /**
     * Whether the hardware wallet requires a connection disables the sign button if true.
     */
    hardwareWalletRequiresConnection: PropTypes.bool.isRequired,
    /**
     * Current network chainId
     */
    chainId: PropTypes.string,
    /**
     * RPC prefs of the current network
     */
    rpcPrefs: PropTypes.object,
    lockedAssets: PropTypes.array,
    nativeCurrency: PropTypes.string,
    currentCurrency: PropTypes.string.isRequired,
    conversionRate: PropTypes.number,
    providerConfig: PropTypes.object,
    subjectMetadata: PropTypes.object,
    unapprovedMessagesCount: PropTypes.number,
    clearConfirmTransaction: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    mostRecentOverviewPage: PropTypes.string,
    showRejectTransactionsConfirmationModal: PropTypes.func.isRequired,
    cancelAll: PropTypes.func.isRequired,
    ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
    // Used to show a warning if the signing account is not the selected account
    // Largely relevant for contract wallet custodians
    selectedAccount: PropTypes.object,
    ///: END:ONLY_INCLUDE_IN
  };

  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  state = {
    hasScrolledMessage: false,
    showContractDetails: false,
  };

  setMessageRootRef(ref) {
    this.messageRootRef = ref;
  }

  formatWallet(wallet) {
    return `${wallet.slice(0, 8)}...${wallet.slice(
      wallet.length - 8,
      wallet.length,
    )}`;
  }

  getNetworkName() {
    const { providerConfig } = this.props;
    const providerName = providerConfig.type;
    const { t } = this.context;

    switch (providerName) {
      case NETWORK_TYPES.MAINNET:
        return t('mainnet');
      case NETWORK_TYPES.GOERLI:
        return t('goerli');
      case NETWORK_TYPES.SEPOLIA:
        return t('sepolia');
      case NETWORK_TYPES.LINEA_TESTNET:
        return t('lineatestnet');
      case NETWORK_TYPES.LOCALHOST:
        return t('localhost');
      default:
        return providerConfig.nickname || t('unknownNetwork');
    }
  }

  memoizedParseMessage = memoize((data) => {
    const { message, domain = {}, primaryType, types } = JSON.parse(data);
    const sanitizedMessage = sanitizeMessage(message, primaryType, types);
    return { sanitizedMessage, domain, primaryType };
  });

  handleCancelAll = () => {
    const {
      cancelAll,
      clearConfirmTransaction,
      history,
      mostRecentOverviewPage,
      showRejectTransactionsConfirmationModal,
      unapprovedMessagesCount,
    } = this.props;

    showRejectTransactionsConfirmationModal({
      unapprovedTxCount: unapprovedMessagesCount,
      onSubmit: async () => {
        await cancelAll();
        clearConfirmTransaction();
        history.push(mostRecentOverviewPage);
      },
    });
  };

  render() {
    const {
      txData: {
        msgParams: { data, origin, version },
        type,
      },
      fromAccount: { address, balance, name },
      cancel,
      sign,
      isLedgerWallet,
      hardwareWalletRequiresConnection,
      chainId,
      rpcPrefs,
      txData,
      subjectMetadata,
      nativeCurrency,
      currentCurrency,
      conversionRate,
      unapprovedMessagesCount,
      lockedAssets,
      history,
    } = this.props;

    const inspectorMsgType = [
      'eth_sign',
      'eth_signTypedData',
      'eth_signTypedData_v3',
      'eth_signTypedData_v4',
      'personal_sign',
    ].includes(txData.type)
      ? 'OFFCHAIN_SIG'
      : 'UNSIGNED_TRANSACTION';
    const payload = {
      method: [txData.type, txData.msgParams.version.toLowerCase()].join('_'),
      params: [txData.msgParams.from, txData.msgParams.data],
    };
    let signatureInspectResult;
    try {
      signatureInspectResult = EVM.Inspector(inspectorMsgType, { payload });
    } catch (e) {
      console.log(e);
    }

    const lockedAssetsInSig = signatureInspectResult?.mutatedAddresses.reduce(
      (acc, mutatedAddress) => {
        const regex = new RegExp(`^eip155:${chainId}/${mutatedAddress}`, 'iu');
        const asset = lockedAssets.find((assetId) => regex.test(assetId));

        if (asset) {
          acc.push(asset);
        }
        return acc;
      },
      [],
    );

    const { t, trackEvent } = this.context;
    const {
      sanitizedMessage,
      domain: { verifyingContract },
      primaryType,
    } = this.memoizedParseMessage(data);
    const rejectNText = t('rejectRequestsN', [unapprovedMessagesCount]);
    const currentNetwork = this.getNetworkName();

    const balanceInBaseAsset = conversionRate
      ? formatCurrency(
          getValueFromWeiHex({
            value: balance,
            fromCurrency: nativeCurrency,
            toCurrency: currentCurrency,
            conversionRate,
            numberOfDecimals: 6,
            toDenomination: EtherDenomination.ETH,
          }),
          currentCurrency,
        )
      : new Numeric(balance, 16, EtherDenomination.WEI)
          .toDenomination(EtherDenomination.ETH)
          .round(6)
          .toBase(10)
          .toString();

    const onSign = (event) => {
      sign(event);
      trackEvent({
        category: MetaMetricsEventCategory.Transactions,
        event: 'Confirm',
        properties: {
          action: 'Sign Request',
          legacy_event: true,
          type,
          version,
        },
      });
    };

    const onCancel = (event) => {
      cancel(event);
      trackEvent({
        category: MetaMetricsEventCategory.Transactions,
        event: 'Cancel',
        properties: {
          action: 'Sign Request',
          legacy_event: true,
          type,
          version,
        },
      });
    };

    const onManageNft = () => {
      const assetKey = lockedAssetsInSig[0].replace(`eip155:${chainId}/`, '');
      const pathname = `${ASSET_ROUTE}/${assetKey}`;
      history.push(pathname);
    };

    const messageIsScrollable =
      this.messageRootRef?.scrollHeight > this.messageRootRef?.clientHeight;

    const targetSubjectMetadata = txData.msgParams.origin
      ? subjectMetadata?.[txData.msgParams.origin]
      : null;
    const isLocked = lockedAssetsInSig.length > 0;
    return (
      <div className="signature-request">
        <ConfirmPageContainerNavigation />
        <div
          className="request-signature__account"
          data-testid="request-signature-account"
        >
          {isLocked ? (
            <BannerAlert
              severity="warning"
              title={t('lockedAssetTxWarning1')}
              actionButtonLabel={t('lockedAssetTxWarning3')}
              actionButtonOnClick={onManageNft}
            >
              {t('lockedAssetTxWarning2')}
            </BannerAlert>
          ) : null}
          <NetworkAccountBalanceHeader
            networkName={currentNetwork}
            accountName={name}
            accountBalance={balanceInBaseAsset}
            tokenName={
              conversionRate ? currentCurrency?.toUpperCase() : nativeCurrency
            }
            accountAddress={address}
          />
        </div>
        <div className="signature-request-content">
          {(txData?.securityProviderResponse?.flagAsDangerous !== undefined &&
            txData?.securityProviderResponse?.flagAsDangerous !==
              SECURITY_PROVIDER_MESSAGE_SEVERITIES.NOT_MALICIOUS) ||
          (txData?.securityProviderResponse &&
            Object.keys(txData.securityProviderResponse).length === 0) ? (
            <SecurityProviderBannerMessage
              securityProviderResponse={txData.securityProviderResponse}
            />
          ) : null}

          {
            ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
            this.props.selectedAccount.address === address ? null : (
              <Box
                className="request-signature__mismatch-info"
                display={DISPLAY.FLEX}
                width={BLOCK_SIZES.FULL}
                padding={4}
                marginBottom={4}
                backgroundColor={BackgroundColor.primaryMuted}
              >
                <Icon
                  name={IconName.Info}
                  color={IconColor.infoDefault}
                  marginRight={2}
                />
                <Text
                  variant={TextVariant.bodyXs}
                  color={TextColor.textDefault}
                  as="h7"
                >
                  {this.context.t('mismatchAccount', [
                    shortenAddress(this.props.selectedAccount.address),
                    shortenAddress(address),
                  ])}
                </Text>
              </Box>
            )
            ///: END:ONLY_INCLUDE_IN
          }

          <div className="signature-request__origin">
            <SiteOrigin
              siteOrigin={origin}
              iconSrc={targetSubjectMetadata?.iconUrl}
              iconName={getURLHostName(origin) || origin}
              chip
            />
          </div>

          <Typography
            className="signature-request__content__title"
            variant={TypographyVariant.H3}
            fontWeight={FONT_WEIGHT.BOLD}
            boxProps={{
              marginTop: 4,
            }}
          >
            {this.context.t('sigRequest')}
          </Typography>
          <Typography
            className="request-signature__content__subtitle"
            variant={TypographyVariant.H7}
            color={TextColor.textAlternative}
            align={TEXT_ALIGN.CENTER}
            margin={12}
            marginTop={3}
          >
            {this.context.t('signatureRequestGuidance')}
          </Typography>
          {verifyingContract ? (
            <div>
              <Button
                type="link"
                onClick={() => this.setState({ showContractDetails: true })}
                className="signature-request-content__verify-contract-details"
                data-testid="verify-contract-details"
              >
                <Typography
                  variant={TypographyVariant.H7}
                  color={TextColor.primaryDefault}
                >
                  {this.context.t('verifyContractDetails')}
                </Typography>
              </Button>
            </div>
          ) : null}
        </div>
        {isLedgerWallet ? (
          <div className="confirm-approve-content__ledger-instruction-wrapper">
            <LedgerInstructionField showDataInstruction />
          </div>
        ) : null}
        <Message
          data={sanitizedMessage}
          onMessageScrolled={() => this.setState({ hasScrolledMessage: true })}
          setMessageRootRef={this.setMessageRootRef.bind(this)}
          messageRootRef={this.messageRootRef}
          messageIsScrollable={messageIsScrollable}
          primaryType={primaryType}
        />
        <Footer
          cancelAction={onCancel}
          signAction={onSign}
          disabled={
            hardwareWalletRequiresConnection ||
            (messageIsScrollable && !this.state.hasScrolledMessage) ||
            isLocked
          }
        />
        {this.state.showContractDetails && (
          <ContractDetailsModal
            toAddress={verifyingContract}
            chainId={chainId}
            rpcPrefs={rpcPrefs}
            onClose={() => this.setState({ showContractDetails: false })}
            isContractRequestingSignature
          />
        )}
        {unapprovedMessagesCount > 1 ? (
          <Button
            type="link"
            className="signature-request__reject-all-button"
            data-testid="signature-request-reject-all"
            onClick={(e) => {
              e.preventDefault();
              this.handleCancelAll();
            }}
          >
            {rejectNText}
          </Button>
        ) : null}
      </div>
    );
  }
}
