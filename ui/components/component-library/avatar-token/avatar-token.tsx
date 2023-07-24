import React, { useState, useEffect, Ref } from 'react';
import classnames from 'classnames';
import { AvatarBase } from '../avatar-base';
import {
  Display,
  AlignItems,
  JustifyContent,
  TextColor,
  BorderColor,
  BackgroundColor,
} from '../../../helpers/constants/design-system';
import { AvatarTokenProps, AvatarTokenSize } from './avatar-token.types';

export const AvatarToken = React.forwardRef(
  (
    {
      size = AvatarTokenSize.Md,
      name,
      src,
      showHalo,
      color = TextColor.textDefault,
      backgroundColor = BackgroundColor.backgroundAlternative,
      borderColor = BorderColor.transparent,
      className = '',
      ...props
    }: AvatarTokenProps,
    ref: Ref<HTMLElement>,
  ) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      setShowFallback(!src);
    }, [src]);

    const handleOnError = () => {
      setShowFallback(true);
    };

    const fallbackString = name?.[0] ?? '?';

    return (
      <AvatarBase
        ref={ref}
        size={size}
        display={Display.Flex}
        alignItems={AlignItems.center}
        justifyContent={JustifyContent.center}
        className={classnames(
          'mm-avatar-token',
          showHalo ? 'mm-avatar-token--with-halo' : '',
          className,
        )}
        {...{ backgroundColor, borderColor, color, ...props }}
      >
        {showFallback ? (
          fallbackString
        ) : (
          <>
            {showHalo && (
              <img
                src={src}
                className={
                  showHalo ? 'mm-avatar-token__token-image--blurred' : ''
                }
                aria-hidden="true"
              />
            )}
            <img
              className={
                showHalo
                  ? 'mm-avatar-token__token-image--size-reduced'
                  : 'mm-avatar-token__token-image'
              }
              onError={handleOnError}
              src={src}
              alt={`${name} logo` || 'token logo'}
            />
          </>
        )}
      </AvatarBase>
    );
  },
);

AvatarToken.displayName = 'AvatarToken';
