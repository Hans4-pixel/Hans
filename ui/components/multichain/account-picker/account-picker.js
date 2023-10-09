import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { toChecksumHexAddress } from '@metamask/controller-utils';
import {
  Box,
  AvatarAccount,
  AvatarAccountVariant,
  Icon,
  IconName,
  Text,
  ButtonBase,
  ButtonBaseSize,
} from '../../component-library';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderRadius,
  Display,
  FlexDirection,
  FontWeight,
  IconColor,
  Size,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { getUseBlockie } from '../../../selectors';
import { shortenAddress } from '../../../helpers/utils/util';

export const AccountPicker = ({
  address,
  name,
  onClick,
  disabled = false,
  showAddress = false,
  block = false,
  addressProps = {},
  labelProps = {},
  ...props
}) => {
  const useBlockie = useSelector(getUseBlockie);
  const shortenedAddress = shortenAddress(toChecksumHexAddress(address));

  return (
    <ButtonBase
      className={classnames('multichain-account-picker', {
        'multichain-account-picker--full': block,
      })}
      data-testid="account-menu-icon"
      onClick={onClick}
      backgroundColor={BackgroundColor.transparent}
      borderRadius={BorderRadius.LG}
      ellipsis
      textProps={{
        display: Display.Flex,
        gap: 2,
        alignItems: AlignItems.center,
      }}
      size={showAddress ? ButtonBaseSize.Lg : ButtonBaseSize.Md}
      disabled={disabled}
      {...props}
    >
      <Box
        display={Display.Flex}
        className="multichain-account-picker-container"
        flexDirection={FlexDirection.Column}
        width={BlockSize.Full}
      >
        <Box display={Display.Flex} alignItems={AlignItems.center} gap={1}>
          <AvatarAccount
            variant={
              useBlockie
                ? AvatarAccountVariant.Blockies
                : AvatarAccountVariant.Jazzicon
            }
            address={address}
            size={Size.SM}
            borderColor={BackgroundColor.backgroundDefault} // we currently don't have white color for border hence using backgroundDefault as the border
          />
          <Text
            as="span"
            ellipsis
            {...labelProps}
            className={classnames(
              'multichain-account-picker__label',
              labelProps.className ?? '',
            )}
          >
            {name}
            {showAddress ? (
              <Text
                color={TextColor.textAlternative}
                textAlign={block ? TextAlign.Start : TextAlign.Center}
                variant={TextVariant.bodySm}
                paddingInlineStart={block ? 5 : 0}
                ellipsis
                {...addressProps}
              >
                {shortenedAddress}
              </Text>
            ) : null}
          </Text>
          <Icon
            name={IconName.ArrowDown}
            color={IconColor.iconDefault}
            size={Size.SM}
          />
        </Box>
      </Box>
    </ButtonBase>
  );
};

AccountPicker.propTypes = {
  /**
   * Account name
   */
  name: PropTypes.string.isRequired,
  /**
   * Account address, used for blockie or jazzicon
   */
  address: PropTypes.string.isRequired,
  /**
   * Action to perform when the account picker is clicked
   */
  onClick: PropTypes.func.isRequired,
  /**
   * Represents if the AccountPicker should be actionable
   */
  disabled: PropTypes.bool,
  /**
   * Represents if the account address should display
   */
  showAddress: PropTypes.bool,

  /**
   * Represents if the AccountPicker should take full width
   */
  block: PropTypes.bool,
};
