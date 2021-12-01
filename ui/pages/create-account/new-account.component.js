import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Button from '../../components/ui/button';
import { accountNameExists } from '../../selectors';

export default class NewAccountCreateForm extends Component {
  static defaultProps = {
    newAccountNumber: 0,
  };

  state = {
    newAccountName: '',
    defaultAccountName: this.context.t('newAccountNumberName', [
      this.props.newAccountNumber,
    ]),
  };

  render() {
    const { newAccountName, defaultAccountName } = this.state;
    const {
      history,
      createAccount,
      mostRecentOverviewPage,
      accounts,
    } = this.props;

    const createClick = (_) => {
      createAccount(newAccountName || defaultAccountName)
        .then(() => {
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Add New Account',
              name: 'Added New Account',
            },
          });
          history.push(mostRecentOverviewPage);
        })
        .catch((e) => {
          this.context.metricsEvent({
            eventOpts: {
              category: 'Accounts',
              action: 'Add New Account',
              name: 'Error',
            },
            customVariables: {
              errorMessage: e.message,
            },
          });
        });
    };

    return (
      <div className="new-account-create-form">
        <div className="new-account-create-form__input-label">
          {this.context.t('accountName')}
        </div>
        <div>
          <input
            className={classnames('new-account-create-form__input', {
              'new-account-create-form__input__error': accountNameExists(
                accounts,
                newAccountName,
              ),
            })}
            value={newAccountName}
            placeholder={defaultAccountName}
            onChange={(event) =>
              this.setState({ newAccountName: event.target.value })
            }
            autoFocus
          />
          {accountNameExists(accounts, newAccountName) ? (
            <div
              className={classnames('send-v2__error', 'send-v2__error-amount')}
            >
              {this.context.t('accountNameDuplicate')}
            </div>
          ) : null}
          <div className="new-account-create-form__buttons">
            <Button
              type="secondary"
              large
              className="new-account-create-form__button"
              onClick={() => history.push(mostRecentOverviewPage)}
            >
              {this.context.t('cancel')}
            </Button>
            <Button
              type="primary"
              large
              className="new-account-create-form__button"
              onClick={createClick}
              disabled={accountNameExists(accounts, newAccountName)}
            >
              {this.context.t('create')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

NewAccountCreateForm.propTypes = {
  createAccount: PropTypes.func,
  newAccountNumber: PropTypes.number,
  history: PropTypes.object,
  mostRecentOverviewPage: PropTypes.string.isRequired,
  accounts: PropTypes.array,
};

NewAccountCreateForm.contextTypes = {
  t: PropTypes.func,
  metricsEvent: PropTypes.func,
};
