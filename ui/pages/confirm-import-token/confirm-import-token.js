import React, { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ASSET_ROUTE,
  IMPORT_TOKEN_ROUTE,
} from '../../helpers/constants/routes';
import Button from '../../components/ui/button';
import Identicon from '../../components/ui/identicon';
import TokenBalance from '../../components/ui/token-balance';
import { I18nContext } from '../../contexts/i18n';
import { MetaMetricsContext } from '../../contexts/metametrics';
import { getMostRecentOverviewPage } from '../../ducks/history/history';

const getTokenName = (name, symbol) => {
  return typeof name === 'undefined' ? symbol : `${name} (${symbol})`;
};

const ConfirmImportToken = (props) => {
  const { addTokens, clearPendingTokens, history } = props;

  const metricsEvent = useContext(MetaMetricsContext);
  const t = useContext(I18nContext);

  const mostRecentOverviewPage = useSelector((state) =>
    getMostRecentOverviewPage(state),
  );
  const pendingTokens = useSelector((state) => state.metamask.pendingTokens);

  const tokenAddedEvent = (pendingToken) => {
    metricsEvent({
      event: 'Token Added',
      category: 'Wallet',
      sensitiveProperties: {
        token_symbol: pendingToken.symbol,
        token_contract_address: pendingToken.address,
        token_decimal_precision: pendingToken.decimals,
        unlisted: pendingToken.unlisted,
        source: pendingToken.isCustom ? 'custom' : 'list',
      },
    });
  };

  useEffect(() => {
    if (Object.keys(pendingTokens).length === 0) {
      history.push(mostRecentOverviewPage);
    }
  }, [history, pendingTokens, mostRecentOverviewPage]);

  return (
    <div className="page-container">
      <div className="page-container__header">
        <div className="page-container__title">
          {t('importTokensCamelCase')}
        </div>
        <div className="page-container__subtitle">
          {t('likeToImportTokens')}
        </div>
      </div>
      <div className="page-container__content">
        <div className="confirm-import-token">
          <div className="confirm-import-token__header">
            <div className="confirm-import-token__token">{t('token')}</div>
            <div className="confirm-import-token__balance">{t('balance')}</div>
          </div>
          <div className="confirm-import-token__token-list">
            {Object.entries(pendingTokens).map(([address, token]) => {
              const { name, symbol } = token;

              return (
                <div
                  className="confirm-import-token__token-list-item"
                  key={address}
                >
                  <div className="confirm-import-token__token confirm-import-token__data">
                    <Identicon
                      className="confirm-import-token__token-icon"
                      diameter={48}
                      address={address}
                    />
                    <div className="confirm-import-token__name">
                      {getTokenName(name, symbol)}
                    </div>
                  </div>
                  <div className="confirm-import-token__balance">
                    <TokenBalance token={token} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="page-container__footer">
        <footer>
          <Button
            type="secondary"
            large
            className="page-container__footer-button"
            onClick={() => history.push(IMPORT_TOKEN_ROUTE)}
          >
            {t('back')}
          </Button>
          <Button
            type="primary"
            large
            className="page-container__footer-button"
            onClick={() => {
              addTokens(pendingTokens).then(() => {
                const pendingTokenValues = Object.values(pendingTokens);
                pendingTokenValues.forEach((pendingToken) => {
                  tokenAddedEvent(pendingToken);
                });
                clearPendingTokens();
                const firstTokenAddress = pendingTokenValues?.[0].address?.toLowerCase();
                if (firstTokenAddress) {
                  history.push(`${ASSET_ROUTE}/${firstTokenAddress}`);
                } else {
                  history.push(mostRecentOverviewPage);
                }
              });
            }}
          >
            {t('importTokensCamelCase')}
          </Button>
        </footer>
      </div>
    </div>
  );
};

ConfirmImportToken.propTypes = {
  addTokens: PropTypes.func,
  clearPendingTokens: PropTypes.func,
  history: PropTypes.object,
};

export default ConfirmImportToken;
