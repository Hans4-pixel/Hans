import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Tabs, Tab } from '../../../ui/tabs';
import DetailedErrorMessage from '../../../ui/detailed-error-message';
import ErrorMessage from '../../../ui/error-message';
import ActionableMessage from '../../../ui/actionable-message/actionable-message';
import { PageContainerFooter } from '../../../ui/page-container';
import TransactionErrorDetailsModal from '../../modals/transaction-error-details-modal/transaction-error-details';
import { ConfirmPageContainerSummary, ConfirmPageContainerWarning } from '.';

export default class ConfirmPageContainerContent extends Component {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  };

  state = {
    showTransactionErrorDetails: false,
  };

  static propTypes = {
    action: PropTypes.string,
    dataComponent: PropTypes.node,
    dataHexComponent: PropTypes.node,
    detailsComponent: PropTypes.node,
    errorKey: PropTypes.string,
    errorMessage: PropTypes.string,
    hasSimulationError: PropTypes.bool,
    hideSubtitle: PropTypes.bool,
    identiconAddress: PropTypes.string,
    nonce: PropTypes.string,
    subtitleComponent: PropTypes.node,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    titleComponent: PropTypes.node,
    warning: PropTypes.string,
    origin: PropTypes.string.isRequired,
    ethGasPriceWarning: PropTypes.string,
    // Footer
    onCancelAll: PropTypes.func,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    onSubmit: PropTypes.func,
    setUserAcknowledgedGasMissing: PropTypes.func,
    submitText: PropTypes.string,
    disabled: PropTypes.bool,
    hideUserAcknowledgedGasMissing: PropTypes.bool,
    unapprovedTxCount: PropTypes.number,
    rejectNText: PropTypes.string,
    hideTitle: PropTypes.bool,
    supportsEIP1559V2: PropTypes.bool,
    hasTopBorder: PropTypes.bool,
    isFailedTransaction: PropTypes.bool,
  };

  renderContent() {
    const { detailsComponent, dataComponent } = this.props;

    if (detailsComponent && dataComponent) {
      return this.renderTabs();
    }
    return detailsComponent || dataComponent;
  }

  renderTabs() {
    const { t } = this.context;
    const { detailsComponent, dataComponent, dataHexComponent } = this.props;

    return (
      <Tabs>
        <Tab
          className="confirm-page-container-content__tab"
          name={t('details')}
        >
          {detailsComponent}
        </Tab>
        <Tab className="confirm-page-container-content__tab" name={t('data')}>
          {dataComponent}
        </Tab>
        {dataHexComponent && (
          <Tab
            className="confirm-page-container-content__tab"
            name={t('dataHex')}
          >
            {dataHexComponent}
          </Tab>
        )}
      </Tabs>
    );
  }

  render() {
    const {
      action,
      errorKey,
      errorMessage,
      hasSimulationError,
      title,
      image,
      titleComponent,
      subtitleComponent,
      hideSubtitle,
      identiconAddress,
      nonce,
      detailsComponent,
      dataComponent,
      warning,
      onCancelAll,
      onCancel,
      cancelText,
      onSubmit,
      submitText,
      disabled,
      unapprovedTxCount,
      rejectNText,
      origin,
      ethGasPriceWarning,
      hideTitle,
      setUserAcknowledgedGasMissing,
      hideUserAcknowledgedGasMissing,
      supportsEIP1559V2,
      hasTopBorder,
      isFailedTransaction,
    } = this.props;

    const primaryAction = hideUserAcknowledgedGasMissing
      ? null
      : {
          label: this.context.t('tryAnywayOption'),
          onClick: setUserAcknowledgedGasMissing,
        };

    return (
      <div
        className={classnames('confirm-page-container-content', {
          'confirm-page-container-content--with-top-border': hasTopBorder,
        })}
      >
        {warning ? <ConfirmPageContainerWarning warning={warning} /> : null}
        {ethGasPriceWarning && (
          <ConfirmPageContainerWarning warning={ethGasPriceWarning} />
        )}
        {hasSimulationError && (
          <div className="confirm-page-container-content__error-container">
            <ActionableMessage
              type="danger"
              primaryAction={primaryAction}
              message={this.context.t('simulationErrorMessage')}
            />
          </div>
        )}
        <ConfirmPageContainerSummary
          className={classnames({
            'confirm-page-container-summary--border':
              !detailsComponent || !dataComponent,
          })}
          action={action}
          title={title}
          image={image}
          titleComponent={titleComponent}
          subtitleComponent={subtitleComponent}
          hideSubtitle={hideSubtitle}
          identiconAddress={identiconAddress}
          nonce={nonce}
          origin={origin}
          hideTitle={hideTitle}
        />
        {this.renderContent()}
        {!supportsEIP1559V2 &&
          !hasSimulationError &&
          (errorKey || errorMessage) && (
            <div className="confirm-page-container-content__error-container">
              {errorKey ? (
                <ErrorMessage errorKey={errorKey} />
              ) : (
                <DetailedErrorMessage
                  errorMessage={this.context.t('somethingWentWrong')}
                  linkText={this.context.t('moreDetails')}
                  onErrorMessageClick={() =>
                    this.setState({ showTransactionErrorDetails: true })
                  }
                />
              )}
            </div>
          )}
        {this.state.showTransactionErrorDetails && (
          <TransactionErrorDetailsModal
            message={errorMessage}
            closePopover={() => {
              this.setState({ showTransactionErrorDetails: false });
            }}
          />
        )}
        <PageContainerFooter
          onCancel={onCancel}
          cancelText={cancelText}
          onSubmit={onSubmit}
          submitText={submitText}
          disabled={disabled}
          hideCancel={isFailedTransaction}
          submitButtonType={isFailedTransaction ? 'default' : 'confirm'}
        >
          {unapprovedTxCount > 1 && !isFailedTransaction ? (
            <a onClick={onCancelAll}>{rejectNText}</a>
          ) : null}
        </PageContainerFooter>
      </div>
    );
  }
}
