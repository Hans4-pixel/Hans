import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Box,
  IconName,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '../../component-library';
import { SelectActionModalItem } from '../select-action-modal-item';
import useRamps from '../../../hooks/experiences/useRamps';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
  MetaMetricsSwapsEventSource,
} from '../../../../shared/constants/metametrics';
import {
  getCurrentChainId,
  getCurrentKeyring,
  getIsBridgeChain,
  getIsSwapsChain,
  getMetaMetricsId,
  getSwapsDefaultToken,
} from '../../../selectors';
import {
  BUILD_QUOTE_ROUTE,
  SEND_ROUTE,
} from '../../../helpers/constants/routes';
import { startNewDraftTransaction } from '../../../ducks/send';
import { I18nContext } from '../../../contexts/i18n';
import { AssetType } from '../../../../shared/constants/transaction';
import { MMI_SWAPS_URL } from '../../../../shared/constants/swaps';
import { setSwapsFromToken } from '../../../ducks/swaps/swaps';
import { isHardwareKeyring } from '../../../helpers/utils/hardware';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import { MMI_STAKE_WEBSITE } from '../../../helpers/constants/common';

export const SelectActionModal = () => {
  const dispatch = useDispatch();
  const t = useContext(I18nContext);
  const trackEvent = useContext(MetaMetricsContext);
  const history = useHistory();
  const chainId = useSelector(getCurrentChainId);
  const isSwapsChain = useSelector(getIsSwapsChain);

  ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-beta,build-flask)
  const location = useLocation();
  const { openBuyCryptoInPdapp } = useRamps();
  const defaultSwapsToken = useSelector(getSwapsDefaultToken);
  const keyring = useSelector(getCurrentKeyring);
  const usingHardwareWallet = isHardwareKeyring(keyring?.type);
  const isBridgeChain = useSelector(getIsBridgeChain);
  const metaMetricsId = useSelector(getMetaMetricsId);

  ///: END:ONLY_INCLUDE_IN

  const stakingEvent = () => {
    trackEvent({
      category: MetaMetricsEventCategory.Navigation,
      event: MetaMetricsEventName.MMIPortfolioButtonClicked,
    });
  };

  return (
    <Modal
      isOpen
      onClose={() => {
        console.log('close'); // TODO: onClose will be replaced with function
      }}
      className="select-action-modal"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          onClose={() => {
            console.log('close'); // TODO: onClose will be replaced with function
          }}
        >
          {t('selectAnAction')}
        </ModalHeader>
        <Box className="select-action-modal__container" marginTop={6}>
          {
            ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-beta,build-flask)
            <SelectActionModalItem
              actionIcon={IconName.Add}
              showIcon
              primaryText={t('buy')}
              secondaryText={t('buyDescription')}
              onClick={() => {
                openBuyCryptoInPdapp();
                trackEvent({
                  event: MetaMetricsEventName.NavBuyButtonClicked,
                  category: MetaMetricsEventCategory.Navigation,
                  properties: {
                    location: 'Home',
                    text: 'Buy',
                    chain_id: chainId,
                    token_symbol: defaultSwapsToken,
                  },
                });
              }}
            />
            ///: END:ONLY_INCLUDE_IN
          }
          {
            ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
            <SelectActionModalItem
              actionIcon={IconName.Stake}
              showIcon
              primaryText={t('stake')}
              onClick={() => {
                stakingEvent();
                global.platform.openTab({
                  url: MMI_STAKE_WEBSITE,
                });
              }}
            />
            ///: END:ONLY_INCLUDE_IN
          }
          <SelectActionModalItem
            actionIcon={IconName.SwapHorizontal}
            primaryText={t('swap')}
            secondaryText={t('swapDescription')}
            onClick={() => {
              ///: BEGIN:ONLY_INCLUDE_IN(build-mmi)
              global.platform.openTab({
                url: MMI_SWAPS_URL,
              });
              ///: END:ONLY_INCLUDE_IN

              ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-beta,build-flask)
              if (isSwapsChain) {
                trackEvent({
                  event: MetaMetricsEventName.NavSwapButtonClicked,
                  category: MetaMetricsEventCategory.Swaps,
                  properties: {
                    token_symbol: 'ETH',
                    location: MetaMetricsSwapsEventSource.MainView,
                    text: 'Swap',
                    chain_id: chainId,
                  },
                });
                dispatch(setSwapsFromToken(defaultSwapsToken));
                if (usingHardwareWallet) {
                  global.platform.openExtensionInBrowser(BUILD_QUOTE_ROUTE);
                } else {
                  history.push(BUILD_QUOTE_ROUTE);
                }
              }
              ///: END:ONLY_INCLUDE_IN
            }}
          />
          <SelectActionModalItem
            actionIcon={IconName.Arrow2UpRight}
            primaryText={t('send')}
            secondaryText={t('sendDescription')}
            onClick={() => {
              trackEvent({
                event: MetaMetricsEventName.NavSendButtonClicked,
                category: MetaMetricsEventCategory.Navigation,
                properties: {
                  token_symbol: 'ETH',
                  location: 'Home',
                  text: 'Send',
                  chain_id: chainId,
                },
              });
              dispatch(
                startNewDraftTransaction({ type: AssetType.native }),
              ).then(() => {
                history.push(SEND_ROUTE);
              });
            }}
          />
          {
            ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-beta,build-flask)
            <SelectActionModalItem
              actionIcon={IconName.Arrow2UpRight}
              showIcon
              primaryText={t('bridge')}
              secondaryText={t('bridgeDescription')}
              onClick={() => {
                if (isBridgeChain) {
                  const portfolioUrl = getPortfolioUrl(
                    'bridge',
                    'ext_bridge_button',
                    metaMetricsId,
                  );
                  global.platform.openTab({
                    url: `${portfolioUrl}${
                      location.pathname.includes('asset') ? '&token=native' : ''
                    }`,
                  });
                  trackEvent({
                    category: MetaMetricsEventCategory.Navigation,
                    event: MetaMetricsEventName.BridgeLinkClicked,
                    properties: {
                      location: 'Home',
                      text: 'Bridge',
                      chain_id: chainId,
                      token_symbol: 'ETH',
                    },
                  });
                }
              }}
            />
            ///: END:ONLY_INCLUDE_IN
          }
        </Box>
      </ModalContent>
    </Modal>
  );
};

// SelectActionModal.propTypes = {
//   /**
//    * onClose handler for Modal
//    */
//   onClose: PropTypes.func,
// };
