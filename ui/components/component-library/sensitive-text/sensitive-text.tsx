import React from 'react';
import { Text } from '../text';
import { SensitiveTextProps, SensitiveLengths } from './sensitive-text.types';

export const SensitiveText = React.forwardRef<
  HTMLParagraphElement,
  SensitiveTextProps
>((props, ref) => {
  const {
    isHidden,
    length = SensitiveLengths.Short,
    children,
    ...restProps
  } = props;
  const fallback = '*'.repeat(length);

  return (
    <Text ref={ref} {...restProps}>
      {isHidden && children ? fallback : children}
    </Text>
  );
});
