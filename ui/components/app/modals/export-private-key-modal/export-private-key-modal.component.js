import log from 'loglevel';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import copyToClipboard from 'copy-to-clipboard';
import Button from '../../../ui/button';
import AccountModalContainer from '../account-modal-container';
import {
  toChecksumHexAddress,
  stripHexPrefix,
} from '../../../../../shared/modules/hexstring-utils';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventKeyType,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';

export default class ExportPrivateKeyModal extends Component {
  static contextTypes = {
    t: PropTypes.func,
    trackEvent: PropTypes.func,
  };

  static defaultProps = {
    warning: null,
    previousModalState: null,
  };

  static propTypes = {
    exportAccount: PropTypes.func.isRequired,
    selectedIdentity: PropTypes.object.isRequired,
    warning: PropTypes.node,
    showAccountDetailModal: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
    hideWarning: PropTypes.func.isRequired,
    clearAccountDetails: PropTypes.func.isRequired,
    previousModalState: PropTypes.string,
  };

  state = {
    password: '',
    privateKey: null,
    showWarning: true,
  };

  componentWillUnmount() {
    this.props.clearAccountDetails();
    this.props.hideWarning();
  }

  exportAccountAndGetPrivateKey = (password, address) => {
    const { exportAccount } = this.props;

    exportAccount(password, address)
      .then((privateKey) => {
        this.context.trackEvent({
          category: MetaMetricsEventCategory.Keys,
          event: MetaMetricsEventName.KeyExportRevealed,
          properties: {
            key_type: MetaMetricsEventKeyType.Pkey,
          },
        });

        this.setState({
          privateKey,
          showWarning: false,
        });
      })
      .catch((e) => {
        this.context.trackEvent({
          category: MetaMetricsEventCategory.Keys,
          event: MetaMetricsEventName.KeyExportFailed,
          properties: {
            key_type: MetaMetricsEventKeyType.Pkey,
            reason: 'incorrect_password',
          },
        });

        log.error(e);
      });
  };

  renderPasswordLabel(privateKey) {
    return (
      <span className="export-private-key-modal__password-label">
        {privateKey
          ? this.context.t('copyPrivateKey')
          : this.context.t('typePassword')}
      </span>
    );
  }

  renderPasswordInput(privateKey) {
    const plainKey = privateKey && stripHexPrefix(privateKey);

    if (!privateKey) {
      return (
        <input
          type="password"
          className="export-private-key-modal__password-input"
          data-testid="password-input"
          onChange={(event) => this.setState({ password: event.target.value })}
        />
      );
    }

    return (
      <div
        className="export-private-key-modal__private-key-display"
        onClick={() => {
          copyToClipboard(plainKey);
          this.context.trackEvent({
            category: MetaMetricsEventCategory.Keys,
            event: MetaMetricsEventName.KeyExportCopied,
            properties: {
              key_type: MetaMetricsEventKeyType.Pkey,
              copy_method: 'clipboard',
            },
          });
        }}
      >
        {plainKey}
      </div>
    );
  }

  renderButtons(privateKey, address, hideModal) {
    return (
      <div className="export-private-key-modal__buttons">
        {!privateKey && (
          <Button
            type="secondary"
            large
            className="export-private-key-modal__button export-private-key-modal__button--cancel"
            onClick={() => {
              this.context.trackEvent({
                category: MetaMetricsEventCategory.Keys,
                event: MetaMetricsEventName.KeyExportCanceled,
                properties: {
                  key_type: MetaMetricsEventKeyType.Pkey,
                },
              });
              hideModal();
            }}
          >
            {this.context.t('cancel')}
          </Button>
        )}
        {privateKey ? (
          <Button
            onClick={() => {
              hideModal();
            }}
            type="primary"
            large
            className="export-private-key-modal__button"
          >
            {this.context.t('done')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              this.context.trackEvent({
                category: MetaMetricsEventCategory.Keys,
                event: MetaMetricsEventName.KeyExportRequested,
                properties: {
                  key_type: MetaMetricsEventKeyType.Pkey,
                },
              });

              this.exportAccountAndGetPrivateKey(this.state.password, address);
            }}
            type="primary"
            large
            className="export-private-key-modal__button"
            disabled={!this.state.password}
          >
            {this.context.t('confirm')}
          </Button>
        )}
      </div>
    );
  }

  render() {
    const {
      selectedIdentity,
      warning,
      showAccountDetailModal,
      hideModal,
      previousModalState,
    } = this.props;
    const { name, address } = selectedIdentity;

    const { privateKey, showWarning } = this.state;

    return (
      <AccountModalContainer
        className="export-private-key-modal"
        selectedIdentity={selectedIdentity}
        showBackButton={previousModalState === 'ACCOUNT_DETAILS'}
        backButtonAction={() => showAccountDetailModal()}
      >
        <span className="export-private-key-modal__account-name">{name}</span>
        <div className="ellip-address-wrapper">
          {toChecksumHexAddress(address)}
        </div>
        <div className="export-private-key-modal__divider" />
        <span className="export-private-key-modal__body-title">
          {this.context.t('showPrivateKeys')}
        </span>
        <div className="export-private-key-modal__password">
          {this.renderPasswordLabel(privateKey)}
          {this.renderPasswordInput(privateKey)}
          {showWarning && warning ? (
            <span className="export-private-key-modal__password--error">
              {warning}
            </span>
          ) : null}
        </div>
        <div className="export-private-key-modal__password--warning">
          {this.context.t('privateKeyWarning')}
        </div>
        {this.renderButtons(privateKey, address, hideModal)}
      </AccountModalContainer>
    );
  }
}
