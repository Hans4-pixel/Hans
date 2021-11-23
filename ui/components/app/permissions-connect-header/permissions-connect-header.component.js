import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Chip from '../../ui/chip';
import IconWithFallback from '../../ui/icon-with-fallback/icon-with-fallback.component';

export default class PermissionsConnectHeader extends Component {
  static propTypes = {
    icon: PropTypes.string,
    iconName: PropTypes.string.isRequired,
    siteOrigin: PropTypes.string.isRequired,
    headerTitle: PropTypes.node,
    headerText: PropTypes.string,
  };

  static defaultProps = {
    icon: null,
    headerTitle: '',
    headerText: '',
  };

  renderHeaderIcon() {
    const { icon, iconName, siteOrigin } = this.props;

    return (
      <div className="permissions-connect-header__icon">
        <Chip
          label={siteOrigin}
          leftIcon={<IconWithFallback icon={icon} name={iconName} size={32} />}
        />
      </div>
    );
  }

  render() {
    const { headerTitle, headerText } = this.props;
    return (
      <div className="permissions-connect-header">
        {this.renderHeaderIcon()}
        <div className="permissions-connect-header__title">{headerTitle}</div>
        <div className="permissions-connect-header__subtitle">{headerText}</div>
      </div>
    );
  }
}
