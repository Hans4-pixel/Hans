import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  ButtonLink,
  Icon,
  IconName,
  IconSize,
  Popover,
  PopoverPosition,
  Text,
} from '../../../../components/component-library';
import {
  AlignItems,
  BackgroundColor,
  BorderColor,
  BorderRadius,
  Display,
  IconColor,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../helpers/constants/design-system';
import { useI18nContext } from '../../../../hooks/useI18nContext';

export const RpcUrlEditor = () => {
  // TODO: real endpoints
  const dummyRpcEndpoints = [
    'https://palmn-mainnet.infura.io',
    'https://palm-mainnet.public.blastapi.io',
    'https://tatum.io/v3/blockchain/node/palm',
  ];

  const t = useI18nContext();
  const rpcDropdown = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentRpcEndpoint, setCurrentRpcEndpoint] = useState(
    dummyRpcEndpoints[0],
  );

  return (
    <>
      <Text
        className="networks-tab__rpc-header"
        marginTop={1}
        marginBottom={1}
        variant={TextVariant.bodySmBold}
      >
        {t('defaultRpcUrl')}
      </Text>
      <Box
        onClick={() => setIsOpen(!isOpen)}
        className="networks-tab__rpc-dropdown"
        display={Display.Flex}
        justifyContent={JustifyContent.spaceBetween}
        borderRadius={BorderRadius.MD}
        borderColor={BorderColor.borderDefault}
        borderWidth={1}
        padding={2}
        ref={rpcDropdown}
      >
        <Text variant={TextVariant.bodySm}>{currentRpcEndpoint}</Text>
        <Icon name={isOpen ? IconName.ArrowUp : IconName.ArrowDown} />
      </Box>
      <Popover
        paddingTop={2}
        paddingBottom={2}
        paddingLeft={0}
        paddingRight={0}
        className="networks-tab__rpc-popover"
        referenceElement={rpcDropdown.current}
        position={PopoverPosition.Bottom}
        isOpen={isOpen}
      >
        {dummyRpcEndpoints.map((rpcEndpoint) => (
          <Box
            padding={4}
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
            key={rpcEndpoint}
            onClick={() => setCurrentRpcEndpoint(rpcEndpoint)}
            className={classnames('networks-tab__rpc-item', {
              'networks-tab__rpc-item--selected':
                rpcEndpoint === currentRpcEndpoint,
            })}
          >
            {rpcEndpoint === currentRpcEndpoint && (
              <Box
                className="networks-tab__rpc-selected-pill"
                borderRadius={BorderRadius.pill}
                backgroundColor={BackgroundColor.primaryDefault}
              />
            )}
            <ButtonLink
              className="networks-tab__rpc-url"
              color={TextColor.textDefault}
              variant={TextVariant.bodySmMedium}
            >
              {rpcEndpoint}
            </ButtonLink>
            <ButtonIcon
              marginLeft={5}
              ariaLabel={t('delete')}
              size={ButtonIconSize.Sm}
              iconName={IconName.Trash}
              color={IconColor.errorDefault}
              // eslint-disable-next-line no-alert
              onClick={() => alert('TODO: delete confirmation modal')}
            />
          </Box>
        ))}
        <Box
          // eslint-disable-next-line no-alert
          onClick={() => alert('TODO: add RPC modal')}
          padding={4}
          display={Display.Flex}
          alignItems={AlignItems.center}
          className="networks-tab__rpc-item"
        >
          <Icon
            color={IconColor.primaryDefault}
            name={IconName.Add}
            size={IconSize.Sm}
            // marginLeft={1}
            marginRight={2}
          />
          <ButtonLink
            className="networks-tab__rpc-add"
            variant={TextVariant.bodySmMedium}
          >
            {t('addRpcUrl')}
          </ButtonLink>
        </Box>
      </Popover>
    </>
  );
};

export default RpcUrlEditor;
