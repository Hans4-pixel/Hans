import React from 'react';
import { t } from '../../../../../app/scripts/translate';
import { TRIGGER_TYPES } from '../../../../../app/scripts/controllers/metamask-notifications/constants/notification-schema';
import { CHAIN_IDS } from '../../../../../shared/constants/network';
import { type ExtractedNotification, isOfTypeNodeGuard } from '../node-guard';
import type { NotificationComponent } from '../types/notifications/notifications';

import { decimalToHex } from '../../../../../shared/modules/conversion.utils';
import { shortenAddress } from '../../../../helpers/utils/util';
import {
  createTextItems,
  getAmount,
  formatAmount,
  getUsdAmount,
  formatIsoDateString,
  getNetworkDetailsByChainId,
} from '../../../../helpers/utils/notification.util';
import {
  TextVariant,
  BackgroundColor,
  TextColor,
} from '../../../../helpers/constants/design-system';

import {
  NotificationListItem,
  NotificationDetailTitle,
  NotificationDetailButton,
  NotificationDetailAddress,
  NotificationDetailInfo,
  NotificationDetailCopyButton,
  NotificationDetailAsset,
  NotificationDetailNetworkFee,
} from '../../../../components/multichain';
import { NotificationListItemIconType } from '../../../../components/multichain/notification-list-item-icon/notification-list-item-icon';
import {
  BadgeWrapperPosition,
  IconName,
  ButtonVariant,
} from '../../../../components/component-library';

type ETHNotification = ExtractedNotification<
  TRIGGER_TYPES.ETH_RECEIVED | TRIGGER_TYPES.ETH_SENT
>;
const isETHNotification = isOfTypeNodeGuard([
  TRIGGER_TYPES.ETH_RECEIVED,
  TRIGGER_TYPES.ETH_SENT,
]);

const isSent = (n: ETHNotification) => n.type === TRIGGER_TYPES.ETH_SENT;

const title = (n: ETHNotification) =>
  isSent(n) ? t('notificationItemSentTo') : t('notificationItemReceivedFrom');

const getNativeCurrency = (n: ETHNotification) => {
  const chainId = decimalToHex(n.chain_id);
  const nativeCurrency = getNetworkDetailsByChainId(
    `0x${chainId}` as keyof typeof CHAIN_IDS,
  );
  return nativeCurrency;
};

const getTitle = (n: ETHNotification) => {
  const address = shortenAddress(isSent(n) ? n.data.to : n.data.from);
  const items = createTextItems([title(n) || '', address], TextVariant.bodySm);
  return items;
};

const getDescription = (n: ETHNotification) => {
  const { nativeCurrencyName } = getNativeCurrency(n);
  const items = createTextItems([nativeCurrencyName], TextVariant.bodyMd);
  return items;
};

export const components: NotificationComponent<ETHNotification> = {
  guardFn: isETHNotification,
  item: ({ notification, onClick }) => {
    const { nativeCurrencySymbol, nativeCurrencyLogo } =
      getNativeCurrency(notification);
    return (
      <NotificationListItem
        id={notification.id}
        isRead={notification.isRead}
        icon={{
          type: NotificationListItemIconType.Token,
          value: nativeCurrencyLogo,
          badge: {
            icon: isSent(notification)
              ? IconName.Arrow2UpRight
              : IconName.Received,
            position: BadgeWrapperPosition.bottomRight,
          },
        }}
        title={getTitle(notification)}
        description={getDescription(notification)}
        createdAt={new Date(notification.createdAt)}
        amount={`${formatAmount(parseFloat(notification.data.amount.eth), {
          shouldEllipse: true,
        })} ${nativeCurrencySymbol}`}
        onClick={onClick}
      />
    );
  },
  details: {
    title: ({ notification }) => {
      const chainId = decimalToHex(notification.chain_id);
      const { nativeCurrencySymbol } = getNetworkDetailsByChainId(
        `0x${chainId}` as keyof typeof CHAIN_IDS,
      );
      return (
        <NotificationDetailTitle
          title={`${
            isSent(notification)
              ? t('notificationItemSent')
              : t('notificationItemReceived')
          } ${nativeCurrencySymbol}`}
          date={formatIsoDateString(notification.createdAt)}
        />
      );
    },
    body: {
      type: 'body_onchain_notification',
      From: ({ notification }) => (
        <NotificationDetailAddress
          side={`${t('notificationItemFrom')}${
            isSent(notification) ? ` (${t('you')})` : ''
          }`}
          address={notification.data.from}
        />
      ),
      To: ({ notification }) => (
        <NotificationDetailAddress
          side={`${t('notificationItemTo')}${
            isSent(notification) ? '' : ` (${t('you')})`
          }`}
          address={notification.data.to}
        />
      ),
      Status: ({ notification }) => (
        <NotificationDetailInfo
          icon={{
            iconName: IconName.Check,
            color: TextColor.successDefault,
            backgroundColor: BackgroundColor.successMuted,
          }}
          label={t('notificationItemStatus') || ''}
          detail={t('notificationItemConfirmed') || ''}
          action={
            <NotificationDetailCopyButton
              text={notification.tx_hash}
              displayText={t('notificationItemTransactionId') || ''}
            />
          }
        />
      ),
      Asset: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo, nativeCurrencySymbol } =
          getNetworkDetailsByChainId(`0x${chainId}` as keyof typeof CHAIN_IDS);
        return (
          <NotificationDetailAsset
            icon={{
              src: nativeCurrencyLogo,
              badge: {
                src: nativeCurrencyLogo,
                position: BadgeWrapperPosition.topRight,
              },
            }}
            label={t('asset') || ''}
            detail={nativeCurrencySymbol}
            fiatValue={`$${getUsdAmount(
              notification.data.amount.eth,
              '18',
              notification.data.amount.usd,
            )}`}
            value={`${getAmount(notification.data.amount.eth, '18', {
              shouldEllipse: true,
            })} ${nativeCurrencySymbol}`}
          />
        );
      },
      Network: ({ notification }) => {
        const chainId = decimalToHex(notification.chain_id);
        const { nativeCurrencyLogo, nativeCurrencyName } =
          getNetworkDetailsByChainId(`0x${chainId}` as keyof typeof CHAIN_IDS);

        return (
          <NotificationDetailAsset
            icon={{
              src: nativeCurrencyLogo,
            }}
            label={t('notificationDetailNetwork') || ''}
            detail={nativeCurrencyName}
          />
        );
      },
      NetworkFee: ({ notification }) => {
        return <NotificationDetailNetworkFee notification={notification} />;
      },
    },
  },
  footer: {
    type: 'footer_onchain_notification',
    ScanLink: ({ notification }) => {
      const chainId = decimalToHex(notification.chain_id);
      const { nativeBlockExplorerUrl } = getNetworkDetailsByChainId(
        `0x${chainId}` as keyof typeof CHAIN_IDS,
      );
      return (
        <NotificationDetailButton
          variant={ButtonVariant.Secondary}
          text={t('notificationItemCheckBlockExplorer') || ''}
          href={
            nativeBlockExplorerUrl
              ? `${nativeBlockExplorerUrl}//tx/${notification.tx_hash}`
              : '#'
          }
          id={notification.id}
        />
      );
    },
  },
};
