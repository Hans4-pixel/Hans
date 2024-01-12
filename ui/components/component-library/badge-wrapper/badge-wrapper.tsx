import React from 'react';
import classnames from 'classnames';

import { Display } from '../../../helpers/constants/design-system';
import { Box } from '..';
import type { PolymorphicRef } from '../box';

import {
  BadgeWrapperPosition,
  BadgeWrapperAnchorElementShape,
  BadgeWrapperProps,
  BadgeWrapperComponent,
} from './badge-wrapper.types';

export const BadgeWrapper: BadgeWrapperComponent = React.forwardRef(
  <C extends React.ElementType = 'div'>(
    {
      children,
      badge,
      badgeContainerProps,
      position = BadgeWrapperPosition.topRight,
      positionObj,
      anchorElementShape = BadgeWrapperAnchorElementShape.circular,
      className = '',
      as: _as, // ignore, `as` in props is not a valid property on `Box`
      ...props
    }: BadgeWrapperProps<C>,
    ref?: PolymorphicRef<C>,
  ) => (
    <Box
      className={classnames('mm-badge-wrapper', className)}
      ref={ref}
      display={Display.InlineBlock}
      {...props}
    >
      {/* Generally the AvatarAccount or AvatarToken */}
      {children}
      <Box
        className={classnames('mm-badge-wrapper__badge-container', {
          [`mm-badge-wrapper__badge-container--${anchorElementShape}-${position}`]:
            !positionObj,
        })}
        style={{ ...positionObj }}
        {...badgeContainerProps}
      >
        {/* Generally the AvatarNetwork at SIZES.XS */}
        {badge}
      </Box>
    </Box>
  ),
);
