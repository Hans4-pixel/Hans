import React from 'react';
import classnames from 'classnames';

import {
  AlignItems,
  BackgroundColor,
  BorderRadius,
  Display,
  IconColor,
  JustifyContent,
} from '../../../helpers/constants/design-system';

import { Box, Icon, IconSize } from '..';
import { BoxProps, PolymorphicRef } from '../box';
import { ButtonIconSize, ButtonIconProps } from './button-icon.types';

export const ButtonIcon = React.forwardRef(
  <C extends React.ElementType = 'button' | 'a'>(
    {
      ariaLabel,
      as,
      className = '',
      color = IconColor.iconDefault,
      href,
      size = ButtonIconSize.Lg,
      iconName,
      disabled,
      iconProps,
      ...props
    }: ButtonIconProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const tag = href ? 'a' : as || 'button';
    const isDisabled = disabled && tag === 'button';
    return (
      <Box
        aria-label={ariaLabel}
        as={tag}
        className={classnames(
          'mm-button-icon',
          `mm-button-icon--size-${String(size)}`,
          {
            'mm-button-icon--disabled': Boolean(disabled),
          },
          className,
        )}
        color={color}
        {...(isDisabled ? { disabled: true } : {})} // only allow disabled attribute to be passed down to the Box when the as prop is equal to a button element
        display={Display.InlineFlex}
        justifyContent={JustifyContent.center}
        alignItems={AlignItems.center}
        borderRadius={BorderRadius.LG}
        backgroundColor={BackgroundColor.transparent}
        {...(href ? { href } : {})}
        ref={ref}
        {...(props as BoxProps<C>)}
      >
        <Icon name={iconName} size={IconSize.Sm} color={color} {...iconProps} />
      </Box>
    );
  },
);
