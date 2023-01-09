import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { COLORS, SIZES } from '../../../helpers/constants/design-system';

import { ButtonBase } from '../button-base';
import { BUTTON_PRIMARY_SIZES } from './button-primary.constants';

export const ButtonPrimary = ({
  className,
  danger,
  disabled,
  size = SIZES.MD,
  ...props
}) => {
  return (
    <ButtonBase
      className={classnames(className, 'mm-button-primary', {
        'mm-button-primary--type-danger': danger,
        'mm-button-primary--disabled': disabled,
      })}
      size={size}
      backgroundColor={danger ? COLORS.ERROR_DEFAULT : COLORS.PRIMARY_DEFAULT}
      borderColor={danger ? COLORS.ERROR_DEFAULT : COLORS.PRIMARY_DEFAULT}
      color={danger ? COLORS.ERROR_INVERSE : COLORS.PRIMARY_INVERSE}
      {...{ disabled, ...props }}
    />
  );
};

ButtonPrimary.propTypes = {
  /**
   * An additional className to apply to the ButtonPrimary.
   */
  className: PropTypes.string,
  /**
   * When true, `ButtonPrimary` color becomes Danger.
   */
  danger: PropTypes.bool,
  /**
   * Boolean to disable button
   */
  disabled: PropTypes.bool,
  /**
   * Possible size values: 'SIZES.SM'(32px), 'SIZES.MD'(40px), 'SIZES.LG'(48px).
   * Default value is 'SIZES.MD'.
   */
  size: PropTypes.oneOf(Object.values(BUTTON_PRIMARY_SIZES)),
  /**
   * ButtonPrimary accepts all the props from ButtonBase
   */
  ...ButtonBase.propTypes,
};
