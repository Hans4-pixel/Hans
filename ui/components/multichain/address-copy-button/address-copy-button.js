import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Icon, ICON_NAMES, Text, ButtonBase } from '../../component-library';
import {
  BackgroundColor,
  IconColor,
  TextVariant,
  TextColor,
  Size,
} from '../../../helpers/constants/design-system';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { shortenAddress } from '../../../helpers/utils/util';
import Tooltip from '../../ui/tooltip/tooltip';
import { useI18nContext } from '../../../hooks/useI18nContext';

export const AddressCopyButton = ({
  address,
  shorten = false,
  wrap = false,
}) => {
  const displayAddress = shorten ? shortenAddress(address) : address;
  const [copied, handleCopy] = useCopyToClipboard();
  const t = useI18nContext();

  return (
    <Tooltip position="bottom" title={copied ? t('copiedExclamation') : null}>
      <ButtonBase
        backgroundColor={BackgroundColor.primaryMuted}
        onClick={() => handleCopy(address)}
        padding={0}
        paddingRight={3}
        paddingLeft={3}
        size={Size.SM}
        className={classnames('multichain-address-copy-button', {
          'multichain-address-copy-button--wrap': wrap,
        })}
      >
        <Text
          variant={TextVariant.bodyXs}
          color={TextColor.primaryDefault}
          data-testid="address-copy-button-text"
          className={classnames({
            'multichain-address-copy-button__address--wrap': wrap,
          })}
        >
          {displayAddress}
        </Text>
        <Icon
          color={IconColor.primaryDefault}
          name={copied ? ICON_NAMES.COPY_SUCCESS : ICON_NAMES.COPY}
          size={Size.SM}
        />
      </ButtonBase>
    </Tooltip>
  );
};

AddressCopyButton.propTypes = {
  address: PropTypes.string.isRequired,
  shorten: PropTypes.bool,
  wrap: PropTypes.bool,
};
