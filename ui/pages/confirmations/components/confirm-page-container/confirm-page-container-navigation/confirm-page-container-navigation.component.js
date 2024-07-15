import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
  getQueuedRequestCount,
  pendingConfirmationsSortedSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unconfirmedTransactionsListSelector,
} from '../../../../../selectors';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  CONFIRM_TRANSACTION_ROUTE,
  SIGNATURE_REQUEST_PATH,
} from '../../../../../helpers/constants/routes';
import { clearConfirmTransaction } from '../../../../../ducks/confirm-transaction/confirm-transaction.duck';
import { MetaMetricsContext } from '../../../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../../shared/constants/metametrics';

const ConfirmPageContainerNavigation = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  const unapprovedDecryptMsgs = useSelector(unapprovedDecryptMsgsSelector);
  const unapprovedEncryptionPublicKeyMsgs = useSelector(
    unapprovedEncryptionPublicKeyMsgsSelector,
  );
  const unconfirmedTransactions =
    useSelector(unconfirmedTransactionsListSelector) ?? [];

  const enumUnapprovedDecryptMsgsKey = Object.keys(unapprovedDecryptMsgs || {});
  const enumUnapprovedEncryptMsgsKey = Object.keys(
    unapprovedEncryptionPublicKeyMsgs || {},
  );
  const enumDecryptAndEncryptMsgs = [
    ...enumUnapprovedDecryptMsgsKey,
    ...enumUnapprovedEncryptMsgsKey,
  ];

  const enumUnapprovedTxs = unconfirmedTransactions
    .map((tx) => tx.id)
    .filter((key) => enumDecryptAndEncryptMsgs.includes(key) === false);

  const currentPosition = enumUnapprovedTxs.indexOf(id);

  const totalTx = enumUnapprovedTxs.length;
  const positionOfCurrentTx = currentPosition + 1;
  const nextTxId = enumUnapprovedTxs[currentPosition + 1];
  const prevTxId = enumUnapprovedTxs[currentPosition - 1];
  const showNavigation = enumUnapprovedTxs.length > 1;
  const firstTx = enumUnapprovedTxs[0];
  const lastTx = enumUnapprovedTxs[enumUnapprovedTxs.length - 1];

  const onNextTx = (txId) => {
    if (txId) {
      dispatch(clearConfirmTransaction());
      const position = enumUnapprovedTxs.indexOf(txId);
      history.push(
        unconfirmedTransactions[position]?.msgParams
          ? `${CONFIRM_TRANSACTION_ROUTE}/${txId}${SIGNATURE_REQUEST_PATH}`
          : `${CONFIRM_TRANSACTION_ROUTE}/${txId}`,
      );
    }
  };

  const pendingConfirmations = useSelector(pendingConfirmationsSortedSelector);
  const queuedRequestCount = useSelector(getQueuedRequestCount);
  const trackEvent = useContext(MetaMetricsContext);
  const [metricsSent, setMetricsSent] = useState(false);

  if (queuedRequestCount > 0 && !metricsSent) {
    trackEvent({
      event: MetaMetricsEventName.ConfirmationQueued,
      category: MetaMetricsEventCategory.Confirmations,
      properties: {
        confirmation_type: pendingConfirmations[0].type,
        referrer: pendingConfirmations[0].origin,
        queue_size: queuedRequestCount,
        queue_type: 'navigation_header',
      },
    });

    setMetricsSent(true);
  }

  return (
    <div
      className="confirm-page-container-navigation"
      style={{
        display: showNavigation ? 'flex' : 'none',
      }}
    >
      <div
        className="confirm-page-container-navigation__container"
        data-testid="navigation-container"
        style={{
          visibility: prevTxId ? 'initial' : 'hidden',
        }}
      >
        <button
          className="confirm-page-container-navigation__arrow"
          data-testid="first-page"
          onClick={() => onNextTx(firstTx)}
        >
          <i className="fa fa-angle-double-left fa-2x" />
        </button>
        <button
          className="confirm-page-container-navigation__arrow"
          data-testid="previous-page"
          onClick={() => onNextTx(prevTxId)}
        >
          <i className="fa fa-angle-left fa-2x" />
        </button>
      </div>
      <div className="confirm-page-container-navigation__textcontainer">
        <div className="confirm-page-container-navigation__navtext">
          {positionOfCurrentTx} {t('ofTextNofM')} {totalTx}
        </div>
        <div className="confirm-page-container-navigation__longtext">
          {t('requestsAwaitingAcknowledgement')}
        </div>
      </div>
      <div
        className="confirm-page-container-navigation__container"
        style={{
          visibility: nextTxId ? 'initial' : 'hidden',
        }}
      >
        <button
          className="confirm-page-container-navigation__arrow"
          data-testid="next-page"
          onClick={() => onNextTx(nextTxId)}
        >
          <i className="fa fa-angle-right fa-2x" />
        </button>
        <button
          className="confirm-page-container-navigation__arrow"
          data-testid="last-page"
          onClick={() => onNextTx(lastTx)}
        >
          <i className="fa fa-angle-double-right fa-2x" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmPageContainerNavigation;
