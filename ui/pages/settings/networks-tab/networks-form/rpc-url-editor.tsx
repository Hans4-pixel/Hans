import React, { useRef, useState } from 'react';
import classnames from 'classnames';
import {
  NetworkConfiguration,
  RpcEndpointType,
} from '@metamask/network-controller';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
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
import { infuraProjectId } from '../../../../../shared/constants/network';

export const RpcUrlEditor = ({
  stagedRpcUrls,
  onRpcUrlAdd,
  onRpcUrlDeleted,
  onRpcUrlSelected,
  setRpcUrls,
}: {
  chainId: string;
  stagedRpcUrls: Pick<
    NetworkConfiguration,
    'rpcEndpoints' | 'defaultRpcEndpointIndex'
  >;
  onRpcUrlAdd: () => void;
  onRpcUrlDeleted: (url: string) => void;
  onRpcUrlSelected: (url: string) => void;
  setRpcUrls: (url: string) => void;
}) => {
  const t = useI18nContext();

  const rpcDropdown = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const defaultRpcUrl =
    stagedRpcUrls?.rpcEndpoints?.[stagedRpcUrls?.defaultRpcEndpointIndex]
      ?.url ?? '';

  const listRpcs = stagedRpcUrls?.rpcEndpoints ?? [];
  const stripKey = (url: string) => {
    if (url.endsWith('/v3/{infuraProjectId}')) {
      return url.replace('/v3/{infuraProjectId}', '');
    }
    if (url.endsWith(`/v3/${infuraProjectId}`)) {
      return url.replace(`/v3/${infuraProjectId}`, '');
    }
    return url;
  };

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
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="networks-tab__rpc-dropdown"
        display={Display.Flex}
        justifyContent={JustifyContent.spaceBetween}
        borderRadius={BorderRadius.MD}
        borderColor={BorderColor.borderDefault}
        borderWidth={1}
        padding={2}
        ref={rpcDropdown}
      >
        <Text variant={TextVariant.bodySm}>{stripKey(defaultRpcUrl)}</Text>
        <ButtonIcon
          iconName={isDropdownOpen ? IconName.ArrowUp : IconName.ArrowDown}
          ariaLabel={t('defaultRpcUrl')}
          size={ButtonIconSize.Sm}
        />
      </Box>
      <Popover
        paddingTop={2}
        paddingBottom={2}
        paddingLeft={0}
        matchWidth={true}
        paddingRight={0}
        className="networks-tab__rpc-popover"
        referenceElement={rpcDropdown.current}
        position={PopoverPosition.Bottom}
        isOpen={isDropdownOpen}
        onClickOutside={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {listRpcs.map(({ name, url, type }) => (
          <Box
            alignItems={AlignItems.center}
            padding={4}
            display={Display.Flex}
            justifyContent={JustifyContent.spaceBetween}
            key={url}
            onClick={() => {
              onRpcUrlSelected(url);
              setRpcUrls(url);
              setIsDropdownOpen(false);
            }}
            className={classnames('networks-tab__rpc-item', {
              'networks-tab__rpc-item--selected': url === defaultRpcUrl,
            })}
          >
            {url === defaultRpcUrl && (
              <Box
                className="networks-tab__rpc-selected-pill"
                borderRadius={BorderRadius.pill}
                backgroundColor={BackgroundColor.primaryDefault}
              />
            )}
            <Text
              as="button"
              color={TextColor.textDefault}
              variant={TextVariant.bodySmMedium}
              backgroundColor={BackgroundColor.transparent}
              ellipsis
            >
              {stripKey(url)}
            </Text>
            {type != RpcEndpointType.Infura &&
              stagedRpcUrls?.rpcEndpoints.length > 1 && (
                <ButtonIcon
                  marginLeft={1}
                  ariaLabel={t('delete')}
                  size={ButtonIconSize.Sm}
                  iconName={IconName.Trash}
                  color={IconColor.errorDefault}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onRpcUrlDeleted(url);
                  }}
                />
              )}
          </Box>
        ))}
        <Box
          onClick={onRpcUrlAdd}
          padding={4}
          display={Display.Flex}
          alignItems={AlignItems.center}
          className="networks-tab__rpc-item"
        >
          <Icon
            color={IconColor.primaryDefault}
            name={IconName.Add}
            size={IconSize.Sm}
            marginRight={2}
          />
          <Text
            as="button"
            backgroundColor={BackgroundColor.transparent}
            color={TextColor.primaryDefault}
            variant={TextVariant.bodySmMedium}
          >
            {t('addRpcUrl')}
          </Text>
        </Box>
      </Popover>
    </>
  );
};

export default RpcUrlEditor;
