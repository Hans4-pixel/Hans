import React, { useContext, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { zeroAddress } from 'ethereumjs-util';
import { CaipChainId } from '@metamask/utils';
import type { Hex } from '@metamask/utils';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  ButtonLink,
  ButtonLinkSize,
  Icon,
  IconName,
  IconSize,
  Popover,
  PopoverPosition,
  Text,
} from '../../component-library';
import {
  AlignItems,
  BackgroundColor,
  Display,
  IconColor,
  JustifyContent,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import { I18nContext } from '../../../contexts/i18n';
import Tooltip from '../../ui/tooltip';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import { PRIMARY } from '../../../helpers/constants/common';
import {
  getDataCollectionForMarketing,
  getShouldShowAggregatedBalancePopover,
  getMetaMetricsId,
  getParticipateInMetaMetrics,
  getPreferences,
  getSelectedAccount,
  getShouldHideZeroBalanceTokens,
  getTokensMarketData,
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  SwapsEthToken,
  ///: END:ONLY_INCLUDE_IF
} from '../../../selectors';
import Spinner from '../../ui/spinner';

import { PercentageAndAmountChange } from '../../multichain/token-list-item/price/percentage-and-amount-change/percentage-and-amount-change';
import { getMultichainIsEvm } from '../../../selectors/multichain';
import { useAccountTotalFiatBalance } from '../../../hooks/useAccountTotalFiatBalance';
import { GENERAL_ROUTE } from '../../../helpers/constants/routes';
import WalletOverview from './wallet-overview';
import CoinButtons from './coin-buttons';
import { AggregatedPercentageOverview } from './aggregated-percentage-overview';
import { setAggregatedBalancePopover } from '../../../store/actions';

export type CoinOverviewProps = {
  balance: string;
  balanceIsCached: boolean;
  className?: string;
  classPrefix?: string;
  chainId: CaipChainId | Hex;
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  // FIXME: This seems to be for Ethereum only
  defaultSwapsToken?: SwapsEthToken;
  isBridgeChain: boolean;
  isBuyableChain: boolean;
  ///: END:ONLY_INCLUDE_IF
  isSwapsChain: boolean;
  isSigningEnabled: boolean;
};

export const CoinOverview = ({
  balance,
  balanceIsCached,
  className,
  classPrefix = 'coin',
  chainId,
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  defaultSwapsToken,
  isBridgeChain,
  isBuyableChain,
  ///: END:ONLY_INCLUDE_IF
  isSwapsChain,
  isSigningEnabled,
}: CoinOverviewProps) => {
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  // Pre-conditions
  if (isSwapsChain && defaultSwapsToken === undefined) {
    throw new Error('defaultSwapsToken is required');
  }
  ///: END:ONLY_INCLUDE_IF

  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const metaMetricsId = useSelector(getMetaMetricsId);
  const isMetaMetricsEnabled = useSelector(getParticipateInMetaMetrics);
  const isMarketingEnabled = useSelector(getDataCollectionForMarketing);

  const shouldShowPopover = useSelector(getShouldShowAggregatedBalancePopover);
  console.log('🚀 ~ shouldShowPopover:', shouldShowPopover);

  const selectedAccount = useSelector(getSelectedAccount);
  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  const { totalFiatBalance } = useAccountTotalFiatBalance(
    selectedAccount,
    shouldHideZeroBalanceTokens,
  );

  const { showNativeTokenAsMainBalance } = useSelector(getPreferences);
  const balanceToDisplay = showNativeTokenAsMainBalance
    ? balance
    : totalFiatBalance;

  const isEvm = useSelector(getMultichainIsEvm);

  const tokensMarketData = useSelector(getTokensMarketData);
  const [isOpen, setIsOpen] = useState(true);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleClick = () => {
    // todo call dispatch here to isPopoverAlreadyShown to true
    setIsOpen(!isOpen);
    dispatch(setAggregatedBalancePopover());
  };

  const [referenceElement, setReferenceElement] = useState();

  const setBoxRef = (ref) => {
    setReferenceElement(ref);
  };

  const handlePortfolioOnClick = useCallback(() => {
    const url = getPortfolioUrl(
      '',
      'ext_portfolio_button',
      metaMetricsId,
      isMetaMetricsEnabled,
      isMarketingEnabled,
    );
    global.platform.openTab({ url });
    trackEvent({
      category: MetaMetricsEventCategory.Navigation,
      event: MetaMetricsEventName.PortfolioLinkClicked,
      properties: {
        location: 'Home',
        text: 'Portfolio',
      },
    });
  }, [isMarketingEnabled, isMetaMetricsEnabled, metaMetricsId, trackEvent]);

  const renderPercentageAndAmountChange = () => {
    if (isEvm) {
      if (showNativeTokenAsMainBalance) {
        return (
          <Box className="wallet-overview__currency-wrapper">
            <PercentageAndAmountChange
              value={tokensMarketData?.[zeroAddress()]?.pricePercentChange1d}
            />
            <Box
              onClick={handlePortfolioOnClick}
              className="wallet-overview__portfolio_button"
              data-testid="portfolio-link"
            >
              <Text
                variant={TextVariant.bodyMd}
                color={TextColor.primaryDefault}
              >
                {t('portfolio')}
              </Text>

              <Icon
                size={IconSize.Sm}
                name={IconName.Export}
                color={IconColor.primaryDefault}
              />
            </Box>
          </Box>
        );
      }
      return (
        <Box className="wallet-overview__currency-wrapper">
          <AggregatedPercentageOverview />
          <Box
            onClick={handlePortfolioOnClick}
            className="wallet-overview__portfolio_button"
            data-testid="portfolio-link"
          >
            <Text variant={TextVariant.bodyMd} color={TextColor.primaryDefault}>
              {t('portfolio')}
            </Text>

            <Icon
              size={IconSize.Sm}
              name={IconName.Export}
              color={IconColor.primaryDefault}
            />
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <WalletOverview
      balance={
        <Tooltip
          position="top"
          title={t('balanceOutdated')}
          disabled={!balanceIsCached}
        >
          <div className={`${classPrefix}-overview__balance`}>
            <div className={`${classPrefix}-overview__primary-container`}>
              {balanceToDisplay ? (
                <>
                  <Box onMouseEnter={handleMouseEnter} ref={setBoxRef}>
                    <UserPreferencedCurrencyDisplay
                      style={{ display: 'contents' }}
                      className={classnames(
                        `${classPrefix}-overview__primary-balance`,
                        {
                          [`${classPrefix}-overview__cached-balance`]:
                            balanceIsCached,
                        },
                      )}
                      data-testid={`${classPrefix}-overview__primary-currency`}
                      value={balanceToDisplay}
                      type={PRIMARY}
                      ethNumberOfDecimals={4}
                      hideTitle
                      withCheckShowNativeToken
                      isAggregatedFiatOverviewBalance={
                        !showNativeTokenAsMainBalance
                      }
                    />
                  </Box>
                  {shouldShowPopover && // make this === null to correct behavior
                  !showNativeTokenAsMainBalance ? (
                    <Popover
                      referenceElement={referenceElement}
                      isOpen={isOpen}
                      position={PopoverPosition.BottomStart} // TODO ask george about this bottom start issue
                      hasArrow
                      flip
                      backgroundColor={BackgroundColor.overlayAlternative} // TODO check with george on this opacity issue
                      className="balance-popover__container"
                      padding={3}
                      onClickOutside={handleClick}
                      onPressEscKey={handleClick}
                      preventOverflow
                      style={{
                        zIndex: 66,
                      }}
                    >
                      <Box>
                        <Box
                          display={Display.Flex}
                          justifyContent={JustifyContent.spaceBetween}
                        >
                          <Text
                            variant={TextVariant.bodySmBold}
                            color={TextColor.overlayInverse}
                            textAlign={TextAlign.Left}
                            alignItems={AlignItems.flexStart}
                            className="balance-popover__text"
                          >
                            {t('yourBalanceIsAggregated')}
                          </Text>
                          <ButtonIcon
                            size={ButtonIconSize.Sm}
                            color={IconColor.infoInverse}
                            onClick={handleClick}
                            iconName={IconName.Close}
                            justifyContent={JustifyContent.flexEnd}
                          />
                        </Box>

                        <Text
                          variant={TextVariant.bodySm}
                          color={TextColor.overlayInverse}
                          className="balance-popover__text"
                        >
                          {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore: Expected 0-1 arguments, but got 2.
                            t('aggregatedBalancePopover', [
                              <ButtonLink
                                size={ButtonLinkSize.Inherit}
                                textProps={{
                                  variant: TextVariant.bodyMd,
                                  alignItems: AlignItems.flexStart,
                                }}
                                as="a"
                                href={`#${GENERAL_ROUTE}`}
                                // target="_blank"
                                rel="noopener noreferrer"
                              >
                                {t('settings')}
                              </ButtonLink>,
                            ])
                          }
                        </Text>
                      </Box>
                    </Popover>
                  ) : null}
                </>
              ) : (
                <Spinner className="loading-overlay__spinner" />
              )}
              {balanceIsCached && (
                <span className={`${classPrefix}-overview__cached-star`}>
                  *
                </span>
              )}
            </div>
            {renderPercentageAndAmountChange()}
          </div>
        </Tooltip>
      }
      buttons={
        <CoinButtons
          {...{
            chainId,
            isSwapsChain,
            isSigningEnabled,
            ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
            isBridgeChain,
            isBuyableChain,
            defaultSwapsToken,
            ///: END:ONLY_INCLUDE_IF
            classPrefix,
            iconButtonClassName: `${classPrefix}-overview__icon-button`,
          }}
        />
      }
      className={className}
    />
  );
};
