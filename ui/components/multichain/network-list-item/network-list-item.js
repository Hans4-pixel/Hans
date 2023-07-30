import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {
  AlignItems,
  IconColor,
  BorderRadius,
  Color,
  Size,
  JustifyContent,
  TextColor,
  BackgroundColor,
  BlockSize,
  Display,
} from '../../../helpers/constants/design-system';
import {
  AvatarNetwork,
  ButtonIcon,
  Text,
  IconName,
  Box,
} from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import Tooltip from '../../ui/tooltip/tooltip';
import {
  GOERLI_DISPLAY_NAME,
  LINEA_GOERLI_DISPLAY_NAME,
  SEPOLIA_DISPLAY_NAME,
} from '../../../../shared/constants/network';

const MAXIMUM_CHARACTERS_WITHOUT_TOOLTIP = 20;

function getAvatarNetworkColor(name) {
  switch (name) {
    case GOERLI_DISPLAY_NAME:
      return BackgroundColor.goerli;
    case LINEA_GOERLI_DISPLAY_NAME:
      return BackgroundColor.lineaGoerli;
    case SEPOLIA_DISPLAY_NAME:
      return BackgroundColor.sepolia;
    default:
      return undefined;
  }
}

export const NetworkListItem = ({
  name,
  iconSrc,
  selected = false,
  focus = true,
  onClick,
  onDeleteClick,
}) => {
  const t = useI18nContext();
  const networkRef = useRef();

  useEffect(() => {
    if (networkRef.current && focus) {
      networkRef.current.focus();
    }
  }, [networkRef, focus]);

  return (
    <Box
      onClick={onClick}
      padding={4}
      gap={2}
      backgroundColor={selected ? Color.primaryMuted : Color.transparent}
      className={classnames('multichain-network-list-item', {
        'multichain-network-list-item--selected': selected,
      })}
      display={Display.Flex}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.spaceBetween}
      width={BlockSize.Full}
    >
      {selected && (
        <Box
          className="multichain-network-list-item__selected-indicator"
          borderRadius={BorderRadius.pill}
          backgroundColor={Color.primaryDefault}
        />
      )}
      <AvatarNetwork
        backgroundColor={getAvatarNetworkColor(name)}
        name={name}
        src={iconSrc}
      />
      <Box className="multichain-network-list-item__network-name">
        <Text
          ref={networkRef}
          as="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          color={TextColor.textDefault}
          backgroundColor={BackgroundColor.transparent}
          ellipsis
        >
          {name.length > MAXIMUM_CHARACTERS_WITHOUT_TOOLTIP ? (
            <Tooltip
              title={name}
              position="bottom"
              wrapperClassName="multichain-network-list-item__tooltip"
            >
              {name}
            </Tooltip>
          ) : (
            name
          )}
        </Text>
      </Box>
      {onDeleteClick ? (
        <ButtonIcon
          className="multichain-network-list-item__delete"
          color={IconColor.errorDefault}
          iconName={IconName.Trash}
          ariaLabel={t('deleteNetwork')}
          size={Size.SM}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
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
   * Represents if the network item should be keyboard selected
   */
  focus: PropTypes.bool,
};
