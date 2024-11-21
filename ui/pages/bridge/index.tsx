import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, useHistory } from 'react-router-dom';
import { I18nContext } from '../../contexts/i18n';
import { clearSwapsState } from '../../ducks/swaps/swaps';
import {
  DEFAULT_ROUTE,
  SWAPS_MAINTENANCE_ROUTE,
  PREPARE_SWAP_ROUTE,
  CROSS_CHAIN_SWAP_ROUTE,
} from '../../helpers/constants/routes';
import { resetBackgroundSwapsState } from '../../store/actions';
import FeatureToggledRoute from '../../helpers/higher-order-components/feature-toggled-route';
import {
  ButtonIcon,
  ButtonIconSize,
  IconName,
} from '../../components/component-library';
import { getIsBridgeChain, getIsBridgeEnabled } from '../../selectors';
import { getProviderConfig } from '../../../shared/modules/selectors/networks';
import useBridging from '../../hooks/bridge/useBridging';
import {
  Content,
  Footer,
  Header,
} from '../../components/multichain/pages/page';
import { resetBridgeState, setFromChain } from '../../ducks/bridge/actions';
import { useSwapsFeatureFlags } from '../swaps/hooks/useSwapsFeatureFlags';
import PrepareBridgePage from './prepare/prepare-bridge-page';
import { BridgeCTAButton } from './prepare/bridge-cta-button';

const CrossChainSwap = () => {
  const t = useContext(I18nContext);

  // Load swaps feature flags so that we can use smart transactions
  useSwapsFeatureFlags();
  useBridging();

  const history = useHistory();
  const dispatch = useDispatch();

  const isBridgeEnabled = useSelector(getIsBridgeEnabled);
  const providerConfig = useSelector(getProviderConfig);
  const isBridgeChain = useSelector(getIsBridgeChain);

  useEffect(() => {
    isBridgeChain &&
      isBridgeEnabled &&
      providerConfig &&
      dispatch(setFromChain(providerConfig.chainId));
  }, [isBridgeChain, isBridgeEnabled, providerConfig]);

  const resetControllerAndInputStates = async () => {
    await dispatch(resetBridgeState());
  };

  useEffect(() => {
    // Reset controller and inputs before unloading the page
    resetControllerAndInputStates();

    window.addEventListener('beforeunload', resetControllerAndInputStates);

    return () => {
      window.removeEventListener('beforeunload', resetControllerAndInputStates);
      resetControllerAndInputStates();
    };
  }, []);

  const redirectToDefaultRoute = async () => {
    history.push({
      pathname: DEFAULT_ROUTE,
      state: { stayOnHomePage: true },
    });
    dispatch(clearSwapsState());
    await dispatch(resetBackgroundSwapsState());
    await resetControllerAndInputStates();
  };

  return (
    <div className="bridge">
      <div className="bridge__container">
        <Header
          className="bridge__header"
          startAccessory={
            <ButtonIcon
              iconName={IconName.ArrowLeft}
              size={ButtonIconSize.Sm}
              ariaLabel={t('back')}
              onClick={redirectToDefaultRoute}
            />
          }
          endAccessory={
            <ButtonIcon
              iconName={IconName.Setting}
              size={ButtonIconSize.Sm}
              ariaLabel={t('settings')}
            />
          }
        >
          {t('bridge')}
        </Header>
        <Content className="bridge__content">
          <Switch>
            <FeatureToggledRoute
              redirectRoute={SWAPS_MAINTENANCE_ROUTE}
              flag={isBridgeEnabled}
              path={CROSS_CHAIN_SWAP_ROUTE + PREPARE_SWAP_ROUTE}
              render={() => {
                return <PrepareBridgePage />;
              }}
            />
          </Switch>
        </Content>
        <Footer>
          <BridgeCTAButton />
        </Footer>
      </div>
    </div>
  );
};

export default CrossChainSwap;
