import React from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { getProviderConfig } from '../../../ducks/metamask/metamask';
import { getTestNetworkBackgroundColor } from '../../../selectors';
import { NETWORK_TYPES } from '../../../../shared/constants/network';
import { getNetworkLabelKey } from '../../../helpers/utils/i18n-helper';
import { BoxProps, PolymorphicRef } from '../box';
import {
  AvatarNetwork,
  AvatarNetworkSize,
  Box,
  IconName,
  Icon,
  IconSize,
  Text,
} from '..';
import {
  AlignItems,
  BorderRadius,
  TextVariant,
  IconColor,
  BackgroundColor,
  Display,
  BorderColor,
  TextColor,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  PickerNetworkComponent,
  PickerNetworkProps,
} from './picker-network.types';

export const PickerNetwork: PickerNetworkComponent = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      className = '',
      avatarNetworkProps,
      iconProps,
      label,
      labelColor,
      src,
      backgroundColor,
      ...props
    }: PickerNetworkProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const t = useI18nContext();
    const { nickname, type: networkType } = useSelector(getProviderConfig);
    const testNetworkBackgroundColor = useSelector(
      getTestNetworkBackgroundColor,
    );

    const displayLabel =
      label ||
      (networkType === NETWORK_TYPES.RPC
        ? nickname ?? t('privateNetwork')
        : t(getNetworkLabelKey(networkType)));

    return (
      <Box
        className={classnames(
          'mm-picker-network',
          `${
            props.onClick ? 'mm-picker-network-button' : 'mm-picker-network-div'
          }`,
          className,
        )}
        ref={ref}
        as="button"
        backgroundColor={
          backgroundColor ?? BackgroundColor.backgroundAlternative
        }
        alignItems={AlignItems.center}
        paddingLeft={2}
        paddingRight={4}
        gap={2}
        borderRadius={BorderRadius.pill}
        display={Display.Flex}
        borderColor={
          props.onClick ? BorderColor.borderDefault : BorderColor.borderMuted
        }
        {...(props as BoxProps<C>)}
      >
        <AvatarNetwork
          className="mm-picker-network__avatar-network"
          src={src}
          name={displayLabel}
          size={avatarNetworkProps?.size ?? AvatarNetworkSize.Xs}
          backgroundColor={
            avatarNetworkProps?.backgroundColor ?? testNetworkBackgroundColor
          }
          {...avatarNetworkProps}
        />
        <Text
          ellipsis
          variant={TextVariant.bodySm}
          color={labelColor ?? TextColor.textAlternative}
        >
          {displayLabel}
        </Text>
        {props.onClick ? (
          <Icon
            className="mm-picker-network__arrow-down-icon"
            name={IconName.ArrowDown}
            color={IconColor.iconDefault}
            size={IconSize.Xs}
            {...iconProps}
          />
        ) : null}
      </Box>
    );
  },
);
