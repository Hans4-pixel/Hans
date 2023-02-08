import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getAccountNameErrorMessage } from '../../../helpers/utils/accounts';
import { Icon, ICON_NAMES } from '../../component-library';

export default class EditableLabel extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    className: PropTypes.string,
    accounts: PropTypes.array,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  state = {
    isEditing: false,
    value: this.props.defaultValue || '',
  };

  async handleSubmit(isValidAccountName) {
    if (!isValidAccountName) {
      return;
    }

    await this.props.onSubmit(this.state.value);
    this.setState({ isEditing: false });
  }

  renderEditing() {
    const { isValidAccountName, errorMessage } = getAccountNameErrorMessage(
      this.props.accounts,
      this.context,
      this.state.value,
      this.props.defaultValue,
    );

    return (
      <div className={classnames('editable-label', this.props.className)}>
        <input
          type="text"
          required
          dir="auto"
          value={this.state.value}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              this.handleSubmit(isValidAccountName);
            }
          }}
          onChange={(event) => this.setState({ value: event.target.value })}
          data-testid="editable-input"
          className={classnames('large-input', 'editable-label__input', {
            'editable-label__input--error': !isValidAccountName,
          })}
          autoFocus
        />
        <button
          className="editable-label__icon-button"
          onClick={() => this.handleSubmit(isValidAccountName)}
        >
          <Icon name={ICON_NAMES.CHECK} className="editable-label__icon" />
        </button>
        <div className="editable-label__error editable-label__error-amount">
          {errorMessage}
        </div>
      </div>
    );
  }

  renderReadonly() {
    return (
      <div className={classnames('editable-label', this.props.className)}>
        <div className="editable-label__value">{this.state.value}</div>
        <button
          className="editable-label__icon-button"
          data-testid="editable-label-button"
          onClick={() => this.setState({ isEditing: true })}
        >
          <i className="fas fa-pencil-alt editable-label__icon" />
        </button>
      </div>
    );
  }

  render() {
    return this.state.isEditing ? this.renderEditing() : this.renderReadonly();
  }
}
