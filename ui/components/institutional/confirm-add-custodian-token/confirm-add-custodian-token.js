import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Button from '../../ui/button';
import PulseLoader from '../../ui/pulse-loader';
import { CUSTODY_ACCOUNT_ROUTE } from '../../../helpers/constants/routes';
import { BUILT_IN_NETWORKS } from '../../../../shared/constants/network';
import { I18nContext } from '../../../contexts/i18n';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
import { setProviderType } from '../../../store/actions';
import { mmiActionsFactory } from '../../../store/institutional/institution-background';
import { Label, Text } from '../../component-library';
import Box from '../../ui/box';

const ConfirmAddCustodianToken = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const trackEvent = useContext(MetaMetricsContext);
  const mmiActions = mmiActionsFactory();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const connectRequests = useSelector(
    (state) => state.metamask.institutionalFeatures?.connectRequests,
  );

  const [showMore, setShowMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [complianceActivated] = useState();

  const handleConnectError = (e) => {
    let errorMessage = e.message;

    if (!errorMessage) {
      errorMessage = 'Connection error';
    }

    setConnectError(errorMessage);
    setIsLoading(false);
  };

  const renderSelectedToken = () => {
    const connectRequest = connectRequests ? connectRequests[0] : undefined;

    return (
      <div className="selected-token-wrapper">
        <span>
          {showMore && connectRequest?.token
            ? connectRequest?.token
            : `...${connectRequest?.token.slice(-9)}`}
        </span>
        {!showMore && (
          <div className="confirm-action-jwt__show-more">
            <a
              rel="noopener noreferrer"
              onClick={() => {
                setShowMore(true);
              }}
            >
              {t('ShowMore')}
            </a>
          </div>
        )}
      </div>
    );
  };

  const connectRequest = connectRequests ? connectRequests[0] : undefined;

  if (!connectRequest) {
    history.push(mostRecentOverviewPage);
    return null;
  }

  trackEvent({
    category: 'MMI',
    event: 'Custodian onboarding',
    properties: {
      actions: 'Custodian RPC request',
      custodian: connectRequest.custodian,
      apiUrl: connectRequest.apiUrl,
    },
  });

  let custodianLabel = '';

  if (
    connectRequest.labels &&
    connectRequest.labels.some((label) => label.key === 'service')
  ) {
    custodianLabel = connectRequest.labels.find(
      (label) => label.key === 'service',
    ).value;
  }

  return (
    <Box className="page-container">
      <Box className="page-container__header">
        <div className="page-container__title">{t('custodianAccount')}</div>
        <div className="page-container__subtitle">
          {t('mmiAddToken', [connectRequest.origin])}
        </div>
      </Box>
      <Box className="page-container__content">
        {custodianLabel && (
          <>
            <span className="add_custodian_token_spacing">{t('custodian')}</span>
            <Label className="add_custodian_token_confirm__url">
              {custodianLabel}
            </Label>
          </>
        )}

        <div className="add_custodian_token_spacing">{t('token')}</div>
        <div className="add_custodian_token_confirm__token">
          {renderSelectedToken()}
        </div>
        {connectRequest.apiUrl && (
          <>
            <div className="add_custodian_token_spacing">{t('apiUrl')}</div>
            <div className="add_custodian_token_confirm__url">
              {connectRequest.apiUrl}
            </div>
          </>
        )}
      </Box>

      {!complianceActivated && (
        <Box
          className="add_custodian_token_confirm__error"
          data-testid="connect-custodian-token-error"
        >
          <Text data-testid="error-message" className="error">
            {connectError}
          </Text>
        </Box>
      )}

      <Box className="page-container__footer">
        {isLoading ? (
          <footer>
            <PulseLoader />
          </footer>
        ) : (
          <footer>
            <Button
              type="default"
              large
              data-testid="cancel-btn"
              className="page-container__footer-button"
              onClick={() => {
                mmiActions.removeAddTokenConnectRequest({
                  origin: connectRequest.origin,
                  apiUrl: connectRequest.apiUrl,
                  token: connectRequest.token,
                });
                history.push(mostRecentOverviewPage);
                trackEvent({
                  category: 'MMI',
                  event: 'Custodian onboarding',
                  properties: {
                    actions: 'Custodian RPC cancel',
                    custodian: connectRequest.custodian,
                    apiUrl: connectRequest.apiUrl,
                  },
                });
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="primary"
              large
              data-testid="confirm-btn"
              className="page-container__footer-button"
              onClick={async () => {
                setConnectError('');
                setIsLoading(true);

                try {
                  if (connectRequest.chainId) {
                    const networkType = Object.keys(BUILT_IN_NETWORKS).find(
                      (key) =>
                        Number(BUILT_IN_NETWORKS[key].chainId).toString(10) ===
                        connectRequest.chainId.toString(),
                    );
                    await dispatch(setProviderType(networkType));
                  }

                  let custodianName = connectRequest.service.toLowerCase();

                  if (connectRequest.service === 'JSONRPC') {
                    custodianName = connectRequest.environment;
                  }

                  await mmiActions.setCustodianConnectRequest({
                    token: connectRequest.token,
                    apiUrl: connectRequest.apiUrl,
                    custodianName,
                    custodianType: connectRequest.service,
                  });
                  mmiActions.removeAddTokenConnectRequest({
                    origin: connectRequest.origin,
                    apiUrl: connectRequest.apiUrl,
                    token: connectRequest.token,
                  });
                  trackEvent({
                    category: 'MMI',
                    event: 'Custodian onboarding',
                    properties: {
                      actions: 'Custodian RPC confirm',
                      custodian: connectRequest.custodian,
                      apiUrl: connectRequest.apiUrl,
                    },
                  });
                  history.push(CUSTODY_ACCOUNT_ROUTE);
                } catch (e) {
                  handleConnectError(e);
                }
              }}
            >
              {t('confirm')}
            </Button>
          </footer>
        )}
      </Box>
    </Box>
  );
};

export default ConfirmAddCustodianToken;
