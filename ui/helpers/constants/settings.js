import { IconName } from '../../components/component-library';
import {
  ALERTS_ROUTE,
  ADVANCED_ROUTE,
  SECURITY_ROUTE,
  GENERAL_ROUTE,
  ABOUT_US_ROUTE,
  NETWORKS_ROUTE,
  CONTACT_LIST_ROUTE,
  EXPERIMENTAL_ROUTE,
} from './routes';

export const SETTINGS_CONSTANTS = [
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('currencyConversion'),
    descriptionMessage: (t) => t('currencyConversion'),
    route: `${GENERAL_ROUTE}#currency-conversion`,
    iconName: IconName.Setting,
  },
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('primaryCurrencySetting'),
    descriptionMessage: (t) => t('primaryCurrencySettingDescription'),
    route: `${GENERAL_ROUTE}#primary-currency`,
    iconName: IconName.Setting,
  },
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('currentLanguage'),
    descriptionMessage: (t) => t('currentLanguage'),
    route: `${GENERAL_ROUTE}#current-language`,
    iconName: IconName.Setting,
  },
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('theme'),
    descriptionMessage: (t) => t('themeDescription'),
    route: `${GENERAL_ROUTE}#theme`,
    icon: 'fa fa-flask',
  },
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('accountIdenticon'),
    descriptionMessage: (t) => t('accountIdenticon'),
    route: `${GENERAL_ROUTE}#account-identicon`,
    iconName: IconName.Setting,
  },
  {
    tabMessage: (t) => t('general'),
    sectionMessage: (t) => t('hideZeroBalanceTokens'),
    descriptionMessage: (t) => t('hideZeroBalanceTokens'),
    route: `${GENERAL_ROUTE}#zero-balancetokens`,
    iconName: IconName.Setting,
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('stateLogs'),
    descriptionMessage: (t) => t('stateLogsDescription'),
    route: `${ADVANCED_ROUTE}#state-logs`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('clearActivity'),
    descriptionMessage: (t) => t('clearActivityDescription'),
    route: `${ADVANCED_ROUTE}#clear-activity`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('showHexData'),
    descriptionMessage: (t) => t('showHexDataDescription'),
    route: `${ADVANCED_ROUTE}#show-hexdata`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('showFiatConversionInTestnets'),
    descriptionMessage: (t) => t('showFiatConversionInTestnetsDescription'),
    route: `${ADVANCED_ROUTE}#conversion-testnetworks`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('showTestnetNetworks'),
    descriptionMessage: (t) => t('showTestnetNetworksDescription'),
    route: `${ADVANCED_ROUTE}#show-testnets`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('nonceField'),
    descriptionMessage: (t) => t('nonceFieldDescription'),
    route: `${ADVANCED_ROUTE}#customize-nonce`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('autoLockTimeLimit'),
    descriptionMessage: (t) => t('autoLockTimeLimitDescription'),
    route: `${ADVANCED_ROUTE}#autolock-timer`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('preferredLedgerConnectionType'),
    descriptionMessage: (t) => t('preferredLedgerConnectionType'),
    route: `${ADVANCED_ROUTE}#ledger-connection`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('dismissReminderField'),
    descriptionMessage: (t) => t('dismissReminderDescriptionField'),
    route: `${ADVANCED_ROUTE}#dismiss-secretrecovery`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('toggleEthSignField'),
    descriptionMessage: (t) => t('toggleEthSignDescriptionField'),
    route: `${ADVANCED_ROUTE}#toggle-ethsign`,
    icon: 'fas fa-sliders-h',
  },
  {
    tabMessage: (t) => t('contacts'),
    sectionMessage: (t) => t('contacts'),
    descriptionMessage: (t) => t('contacts'),
    route: CONTACT_LIST_ROUTE,
    iconName: IconName.Book,
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('revealSeedWords'),
    descriptionMessage: (t) => t('revealSeedWords'),
    route: `${SECURITY_ROUTE}#reveal-secretrecovery`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('showIncomingTransactions'),
    descriptionMessage: (t) => t('showIncomingTransactionsDescription'),
    route: `${SECURITY_ROUTE}#incoming-transaction`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('usePhishingDetection'),
    descriptionMessage: (t) => t('usePhishingDetectionDescription'),
    route: `${SECURITY_ROUTE}#phishing-detection`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('use4ByteResolution'),
    descriptionMessage: (t) => t('use4ByteResolutionDescription'),
    route: `${SECURITY_ROUTE}#decode-smart-contracts`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('participateInMetaMetrics'),
    descriptionMessage: (t) => t('participateInMetaMetricsDescription'),
    route: `${SECURITY_ROUTE}#metametrics`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('chooseYourNetwork'),
    descriptionMessage: (t) => t('chooseYourNetworkDescription'),
    route: `${SECURITY_ROUTE}#choose-your-network`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('ipfsGateway'),
    descriptionMessage: (t) => t('ipfsGatewayDescription'),
    route: `${SECURITY_ROUTE}#add-custom-ipfs-gateway`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('autoDetectTokens'),
    descriptionMessage: (t) => t('autoDetectTokensDescription'),
    route: `${SECURITY_ROUTE}#auto-detect-tokens`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('useMultiAccountBalanceChecker'),
    descriptionMessage: (t) =>
      t('useMultiAccountBalanceCheckerSettingDescription'),
    route: `${SECURITY_ROUTE}#use-multi-account-balance-checker`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('currencyRateCheckToggle'),
    descriptionMessage: (t) => t('currencyRateCheckToggleDescription'),
    route: `${SECURITY_ROUTE}#price-checker`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('ensDomainsSettingTitle'),
    descriptionMessage: (t) => t('ensDomainsSettingDescriptionIntroduction'),
    route: `${SECURITY_ROUTE}#ens-domains`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('displayNftMedia'),
    descriptionMessage: (t) => t('displayNftMediaDescription'),
    route: `${SECURITY_ROUTE}#display-nft-media`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('securityAndPrivacy'),
    sectionMessage: (t) => t('useNftDetection'),
    descriptionMessage: (t) => t('useNftDetectionDescriptionText'),
    route: `${SECURITY_ROUTE}#autodetect-nfts`,
    icon: 'fa fa-lock',
  },
  {
    tabMessage: (t) => t('alerts'),
    sectionMessage: (t) => t('alertSettingsUnconnectedAccount'),
    descriptionMessage: (t) => t('alertSettingsUnconnectedAccount'),
    route: `${ALERTS_ROUTE}#unconnected-account`,
    iconName: IconName.Notification,
  },
  {
    tabMessage: (t) => t('alerts'),
    sectionMessage: (t) => t('alertSettingsWeb3ShimUsage'),
    descriptionMessage: (t) => t('alertSettingsWeb3ShimUsage'),
    route: `${ALERTS_ROUTE}#web3-shimusage`,
    icon: 'fa fa-bell',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('mainnet'),
    descriptionMessage: (t) => t('mainnet'),
    route: `${NETWORKS_ROUTE}#networks-mainnet`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('lineaMainnet'),
    descriptionMessage: (t) => t('lineaMainnet'),
    route: `${NETWORKS_ROUTE}#networks-linea-mainnet`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('goerli'),
    descriptionMessage: (t) => t('goerli'),
    route: `${NETWORKS_ROUTE}#networks-goerli`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('sepolia'),
    descriptionMessage: (t) => t('sepolia'),
    route: `${NETWORKS_ROUTE}#networks-sepolia`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('lineaGoerli'),
    descriptionMessage: (t) => t('lineaGoerli'),
    route: `${NETWORKS_ROUTE}#networks-linea-goerli`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('networks'),
    sectionMessage: (t) => t('localhost'),
    descriptionMessage: (t) => t('localhost'),
    route: `${NETWORKS_ROUTE}#networks-localhost`,
    icon: 'fa fa-plug',
  },
  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('metamaskVersion'),
    descriptionMessage: (t) => t('builtAroundTheWorld'),
    route: `${ABOUT_US_ROUTE}#version`,
    iconName: IconName.Info,
  },
  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('links'),
    descriptionMessage: (t) => t('links'),
    route: `${ABOUT_US_ROUTE}#links`,
    iconName: IconName.Info,
  },
  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('privacyMsg'),
    descriptionMessage: (t) => t('privacyMsg'),
    route: `${ABOUT_US_ROUTE}#privacy-policy`,
    iconName: IconName.Info,
  },
  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('terms'),
    descriptionMessage: (t) => t('terms'),
    route: `${ABOUT_US_ROUTE}#terms`,
    iconName: IconName.Info,
  },

  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('attributions'),
    descriptionMessage: (t) => t('attributions'),
    route: `${ABOUT_US_ROUTE}#attributions`,
    iconName: IconName.Info,
  },

  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('supportCenter'),
    descriptionMessage: (t) => t('supportCenter'),
    route: `${ABOUT_US_ROUTE}#supportcenter`,
    iconName: IconName.Info,
  },

  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('visitWebSite'),
    descriptionMessage: (t) => t('visitWebSite'),
    route: `${ABOUT_US_ROUTE}#visitwebsite`,
    iconName: IconName.Info,
  },

  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('contactUs'),
    descriptionMessage: (t) => t('contactUs'),
    route: `${ABOUT_US_ROUTE}#contactus`,
    iconName: IconName.Info,
  },
  {
    tabMessage: (t) => t('about'),
    sectionMessage: (t) => t('betaTerms'),
    descriptionMessage: (t) => t('betaTerms'),
    route: `${ABOUT_US_ROUTE}#beta-terms`,
    iconName: IconName.Info,
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('backupUserData'),
    descriptionMessage: (t) => t('backupUserDataDescription'),
    route: `${ADVANCED_ROUTE}#backup-userdata`,
    icon: 'fas fa-download',
  },
  {
    tabMessage: (t) => t('advanced'),
    sectionMessage: (t) => t('restoreUserData'),
    descriptionMessage: (t) => t('restoreUserDataDescription'),
    route: `${ADVANCED_ROUTE}#restore-userdata`,
    icon: 'fas fa-upload',
  },
  {
    tabMessage: (t) => t('experimental'),
    sectionMessage: (t) => t('securityAlerts'),
    descriptionMessage: (t) => t('securityAlertsDescription'),
    route: `${EXPERIMENTAL_ROUTE}#security-alerts`,
    icon: 'fa fa-flask',
  },
];
