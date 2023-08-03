import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ToggleButton from '../../../components/ui/toggle-button';
import {
  getNumberOfSettingsInSection,
  handleSettingsRefs,
} from '../../../helpers/utils/settings-search';
import { MetaMetricsEventCategory } from '../../../../shared/constants/metametrics';

import { Text, Box } from '../../../components/component-library';
import {
  TextColor,
  TextVariant,
  Display,
  FlexDirection,
  JustifyContent,
  FontWeight,
} from '../../../helpers/constants/design-system';
///: BEGIN:ONLY_INCLUDE_IN(desktop)
import DesktopEnableButton from '../../../components/app/desktop-enable-button';
///: END:ONLY_INCLUDE_IN

export default class ExperimentalTab extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static propTypes = {
    useNftDetection: PropTypes.bool,
    setUseNftDetection: PropTypes.func,
    setOpenSeaEnabled: PropTypes.func,
    openSeaEnabled: PropTypes.bool,
    transactionSecurityCheckEnabled: PropTypes.bool,
    setTransactionSecurityCheckEnabled: PropTypes.func,
    ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
    securityAlertsEnabled: PropTypes.bool,
    setSecurityAlertsEnabled: PropTypes.func,
    ///: END:ONLY_INCLUDE_IN
  };

  settingsRefs = Array(
    getNumberOfSettingsInSection(
      this.context.t,
      this.context.t('experimental'),
    ),
  )
    .fill(undefined)
    .map(() => {
      return React.createRef();
    });

  componentDidUpdate() {
    const { t } = this.context;
    handleSettingsRefs(t, t('experimental'), this.settingsRefs);
  }

  componentDidMount() {
    const { t } = this.context;
    handleSettingsRefs(t, t('experimental'), this.settingsRefs);
  }

  ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
  renderSecurityAlertsToggle() {
    const { t } = this.context;

    const { securityAlertsEnabled, setSecurityAlertsEnabled } = this.props;

    return (
      <>
        <Text
          variant={TextVariant.headingSm}
          color={TextColor.textAlternative}
          marginBottom={2}
        >
          {t('security')}
        </Text>
        <div
          ref={this.settingsRefs[1]}
          className="settings-page__content-row settings-page__content-row-experimental"
        >
          <div className="settings-page__content-item">
            <span>{t('securityAlerts')}</span>
            <div className="settings-page__content-description">
              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
              >
                {t('securityAlertsDescription1')}
              </Text>
              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
              >
                {t('securityAlertsDescription2')}
              </Text>

              <Text
                variant={TextVariant.bodySm}
                color={TextColor.textAlternative}
                marginTop={3}
                marginBottom={1}
              >
                {t('selectProvider')}
              </Text>
              <div className="settings-page__content-item-col settings-page__content-item-col-open-sea">
                <Text
                  variant={TextVariant.bodyMd}
                  color={TextColor.textDefault}
                  marginBottom={0}
                >
                  {t('blockaid')}
                </Text>
                <ToggleButton
                  value={securityAlertsEnabled}
                  onToggle={(value) => {
                    this.context.trackEvent({
                      category: MetaMetricsEventCategory.Settings,
                      event: 'Enabled/Disable security_alerts_enabled',
                      properties: {
                        action: 'Enabled/Disable security_alerts_enabled',
                        legacy_event: true,
                      },
                    });
                    setSecurityAlertsEnabled(!value || false);
                  }}
                />
              </div>
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.textMuted}
                marginTop={2}
              >
                {t('moreComingSoon')}
              </Text>
            </div>
          </div>
        </div>
      </>
    );
  }
  ///: END:ONLY_INCLUDE_IN

  renderOpenSeaEnabledToggle() {
    const { t } = this.context;
    const {
      openSeaEnabled,
      setOpenSeaEnabled,
      useNftDetection,
      setUseNftDetection,
    } = this.props;

    return (
      <>
        <Box
          ref={this.settingsRefs[0]}
          className="settings-page__content-row"
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceBetween}
        >
          <div className="settings-page__content-item">
            <span>{t('enableOpenSeaAPI')}</span>
            <div className="settings-page__content-description">
              {t('enableOpenSeaAPIDescription')}
            </div>
          </div>

          <div className="settings-page__content-item-col">
            <ToggleButton
              value={openSeaEnabled}
              onToggle={(value) => {
                this.context.trackEvent({
                  category: MetaMetricsEventCategory.Settings,
                  event: 'Enabled/Disable OpenSea',
                  properties: {
                    action: 'Enabled/Disable OpenSea',
                    legacy_event: true,
                  },
                });
                // value is positive when being toggled off
                if (value && useNftDetection) {
                  setUseNftDetection(false);
                }
                setOpenSeaEnabled(!value);
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </Box>

        <Box
          ref={this.settingsRefs[1]}
          className="settings-page__content-row"
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceBetween}
        >
          <div className="settings-page__content-item">
            <span>{t('useNftDetection')}</span>
            <div className="settings-page__content-description">
              <Text color={TextColor.textAlternative}>
                {t('useNftDetectionDescription')}
              </Text>
              <ul className="settings-page__content-unordered-list">
                <li>{t('useNftDetectionDescriptionLine2')}</li>
                <li>{t('useNftDetectionDescriptionLine3')}</li>
                <li>{t('useNftDetectionDescriptionLine4')}</li>
              </ul>
              <Text color={TextColor.textAlternative} paddingTop={4}>
                {t('useNftDetectionDescriptionLine5')}
              </Text>
            </div>
          </div>

          <div className="settings-page__content-item-col">
            <ToggleButton
              value={useNftDetection}
              onToggle={(value) => {
                this.context.trackEvent({
                  category: MetaMetricsEventCategory.Settings,
                  event: 'NFT Detected',
                  properties: {
                    action: 'NFT Detected',
                    legacy_event: true,
                  },
                });
                if (!value && !openSeaEnabled) {
                  setOpenSeaEnabled(!value);
                }
                setUseNftDetection(!value);
              }}
              offLabel={t('off')}
              onLabel={t('on')}
            />
          </div>
        </Box>
      </>
    );
  }

  renderTransactionSecurityCheckToggle() {
    const { t } = this.context;

    const {
      transactionSecurityCheckEnabled,
      setTransactionSecurityCheckEnabled,
    } = this.props;

    return (
      <>
        <Text
          variant={TextVariant.headingSm}
          as="h4"
          color={TextColor.textAlternative}
          marginBottom={2}
          fontWeight={FontWeight.Bold}
        >
          {t('privacy')}
        </Text>
        <Box
          ref={this.settingsRefs[1]}
          className="settings-page__content-row settings-page__content-row-experimental"
          marginBottom={3}
        >
          <div className="settings-page__content-item">
            <span>{t('transactionSecurityCheck')}</span>
            <div className="settings-page__content-description">
              <Text
                variant={TextVariant.bodySm}
                as="h6"
                color={TextColor.textAlternative}
              >
                {t('transactionSecurityCheckDescription')}
              </Text>
              <Text
                marginTop={3}
                marginBottom={1}
                variant={TextVariant.bodySm}
                as="h6"
                color={TextColor.textAlternative}
              >
                {t('selectProvider')}
              </Text>
              <div className="settings-page__content-item-col settings-page__content-item-col-open-sea">
                <Text
                  variant={TextVariant.bodyMd}
                  as="h5"
                  color={TextColor.textDefault}
                  fontWeight={FontWeight.Medium}
                  marginBottom={0}
                >
                  {t('openSea')}
                </Text>
                <ToggleButton
                  value={transactionSecurityCheckEnabled}
                  onToggle={(value) => {
                    this.context.trackEvent({
                      category: MetaMetricsEventCategory.Settings,
                      event: 'Enabled/Disable TransactionSecurityCheck',
                      properties: {
                        action: 'Enabled/Disable TransactionSecurityCheck',
                        legacy_event: true,
                      },
                    });
                    setTransactionSecurityCheckEnabled(!value);
                  }}
                />
              </div>
              <Text
                variant={TextVariant.bodySm}
                as="h6"
                color={TextColor.textAlternative}
                marginTop={0}
              >
                {t('thisServiceIsExperimental', [
                  <a
                    href="http://opensea.io/securityproviderterms"
                    key="termsOfUse"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t('termsOfUse')}
                  </a>,
                ])}
              </Text>
              <Text
                variant={TextVariant.bodyMd}
                as="h5"
                fontWeight={FontWeight.Medium}
                color={TextColor.textMuted}
                marginTop={2}
              >
                {t('moreComingSoon')}
              </Text>
            </div>
          </div>
        </Box>
      </>
    );
  }

  ///: BEGIN:ONLY_INCLUDE_IN(desktop)
  renderDesktopEnableButton() {
    const { t } = this.context;

    return (
      <Box
        ref={this.settingsRefs[6]}
        className="settings-page__content-row"
        data-testid="advanced-setting-desktop-pairing"
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
      >
        <div className="settings-page__content-item">
          <span>{t('desktopEnableButtonDescription')}</span>
        </div>

        <div className="settings-page__content-item-col">
          <DesktopEnableButton />
        </div>
      </Box>
    );
  }
  ///: END:ONLY_INCLUDE_IN

  render() {
    return (
      <div className="settings-page__body">
        {
          ///: BEGIN:ONLY_INCLUDE_IN(blockaid)
          this.renderSecurityAlertsToggle()
          ///: END:ONLY_INCLUDE_IN
        }
        {this.renderTransactionSecurityCheckToggle()}
        {this.renderOpenSeaEnabledToggle()}
        {
          ///: BEGIN:ONLY_INCLUDE_IN(desktop)
          this.renderDesktopEnableButton()
          ///: END:ONLY_INCLUDE_IN
        }
      </div>
    );
  }
}
