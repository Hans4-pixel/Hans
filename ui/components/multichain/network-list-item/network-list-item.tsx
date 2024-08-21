import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  AlignItems,
  BackgroundColor,
  BlockSize,
  BorderRadius,
  Display,
  JustifyContent,
  TextColor,
  IconColor,
  FlexDirection,
  TextVariant,
  BorderColor,
} from '../../../helpers/constants/design-system';
import {
  AvatarNetwork,
  AvatarNetworkSize,
  Box,
  ButtonIcon,
  ButtonIconSize,
  Icon,
  IconName,
  IconSize,
  Text,
} from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getAvatarNetworkColor } from '../../../helpers/utils/accounts';
import { NetworkListItemMenu } from '../network-list-item-menu';

export const NetworkListItem = ({
  name,
  iconSrc,
  iconSize = AvatarNetworkSize.Md,
  rpcEndpoint,
  selected = false,
  focus = true,
  onClick,
  onDeleteClick,
  onEditClick,
  onRpcEndpointClick,
  startAccessory,
  showEndAccessory = true,
}) => {
  const t = useI18nContext();
  const networkRef = useRef<HTMLInputElement>(null);

  const [networkListItemMenuElement, setNetworkListItemMenuElement] =
    useState();
  const setNetworkListItemMenuRef = (ref) => {
    setNetworkListItemMenuElement(ref);
  };
  const [networkOptionsMenuOpen, setNetworkOptionsMenuOpen] = useState(false);

  const renderButton = () => {
    return onDeleteClick || onEditClick ? (
      <ButtonIcon
        iconName={IconName.MoreVertical}
        ref={setNetworkListItemMenuRef}
        data-testid="network-list-item-options-button"
        ariaLabel={t('networkOptions')}
        onClick={(e) => {
          e.stopPropagation();
          setNetworkOptionsMenuOpen(true);
        }}
        size={ButtonIconSize.Sm}
      />
    ) : null;
  };
  useEffect(() => {
    if (networkRef.current && focus) {
      networkRef.current.focus();
    }
  }, [networkRef, focus]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation(); // Prevent the event from reaching the parent container
      onClick();
    }
  };

  return (
    <Box
      paddingLeft={4}
      paddingRight={4}
      paddingTop={rpcEndpoint ? 2 : 4}
      paddingBottom={rpcEndpoint ? 2 : 4}
      gap={4}
      backgroundColor={
        selected ? BackgroundColor.primaryMuted : BackgroundColor.transparent
      }
      className={classnames('multichain-network-list-item', {
        'multichain-network-list-item--selected': selected,
      })}
      display={Display.Flex}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.spaceBetween}
      width={BlockSize.Full}
      onClick={onClick}
    >
      {startAccessory ? (
        <Box marginInlineEnd={2} marginTop={1}>
          {startAccessory}
        </Box>
      ) : null}
      {selected && (
        <Box
          className="multichain-network-list-item__selected-indicator"
          borderRadius={BorderRadius.pill}
          backgroundColor={BackgroundColor.primaryDefault}
        />
      )}
      <AvatarNetwork
        borderColor={BorderColor.backgroundDefault}
        backgroundColor={getAvatarNetworkColor(name)}
        name={name}
        src={iconSrc}
        size={iconSize}
      />
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Column}
        alignItems={AlignItems.flexStart}
        justifyContent={JustifyContent.flexStart}
        width={BlockSize.Full}
        style={{ overflow: 'hidden' }}
      >
        <Box
          width={BlockSize.Full}
          display={Display.Flex}
          alignItems={AlignItems.center}
          data-testid={name}
        >
          <Text
            ref={networkRef}
            color={TextColor.textDefault}
            backgroundColor={BackgroundColor.transparent}
            ellipsis
            onKeyDown={handleKeyPress}
            tabIndex={0} // Enable keyboard focus
          >
            {name}
            {/* {name?.length > MAXIMUM_CHARACTERS_WITHOUT_TOOLTIP ? (
              <Tooltip
                title={name}
                position="bottom"
                wrapperClassName="multichain-network-list-item__tooltip"
              >
                {name}
              </Tooltip>
            ) : (
              name
            )} */}
          </Text>
        </Box>
        {rpcEndpoint && (
          <Box
            className="multichain-network-list-item__rpc-endpoint"
            display={Display.Flex}
            alignItems={AlignItems.center}
            onClick={(e) => {
              e.stopPropagation();
              onRpcEndpointClick?.();
            }}
          >
            <Text
              padding={0}
              backgroundColor={BackgroundColor.transparent}
              as="button"
              variant={TextVariant.bodySmMedium}
              color={TextColor.textAlternative}
            >
              {rpcEndpoint.name ?? new URL(rpcEndpoint.url).host}
            </Text>
            <Icon
              marginLeft={1}
              color={IconColor.iconAlternative}
              name={IconName.ArrowDown}
              size={IconSize.Xs}
            />
          </Box>
        )}
      </Box>

      {renderButton()}
      {showEndAccessory ? (
        <NetworkListItemMenu
          anchorElement={networkListItemMenuElement}
          isOpen={networkOptionsMenuOpen}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          onClose={() => setNetworkOptionsMenuOpen(false)}
        />
      ) : null}
    </Box>
  );
};

NetworkListItem.propTypes = {
  /**
   * The name of the network
   */
  name: PropTypes.string.isRequired,
  /**
   * Path to the Icon image
   */
  iconSrc: PropTypes.string,
  /**
   * Icon network size
   */
  iconSize: PropTypes.string,
  /**
   * Represents if the network item is selected
   */
  selected: PropTypes.bool,
  /**
   * Executes when the item is clicked
   */
  onClick: PropTypes.func.isRequired,
  /**
   * Executes when the delete icon is clicked
   */
  onDeleteClick: PropTypes.func,
  /**
   * Executes when the edit icon is clicked
   */
  onEditClick: PropTypes.func,
  /**
   * Represents if the network item should be keyboard selected
   */
  focus: PropTypes.bool,
  /**
   * Represents start accessory
   */
  startAccessory: PropTypes.node,
  /**
   * Represents if we need to show menu option
   */
  showEndAccessory: PropTypes.bool,
};
