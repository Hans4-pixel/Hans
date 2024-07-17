import React, { useContext } from 'react';
import { NotificationServicesController } from '@metamask/notification-services-controller';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  IconName,
} from '../../component-library';
import { BlockSize } from '../../../helpers/constants/design-system';

type Notification = NotificationServicesController.Types.INotification;

type NotificationDetailButtonProps = {
  notification: Notification;
  variant: ButtonVariant;
  text: string;
  href: string;
  id: string;
  isExternal?: boolean;
  endIconName?: boolean;
};

export const NotificationDetailButton = ({
  notification,
  variant = ButtonVariant.Secondary,
  text,
  href,
  id,
  isExternal = false,
  endIconName = true,
}: NotificationDetailButtonProps) => {
  const trackEvent = useContext(MetaMetricsContext);

  const onClick = () => {
    trackEvent({
      category: MetaMetricsEventCategory.NotificationInteraction,
      event: MetaMetricsEventName.NotificationDetailClicked,
      properties: {
        notificationId: notification.id,
        notificationType: notification.type,
      },
    });
  };

  return (
    <Button
      key={id}
      href={href}
      variant={variant}
      externalLink={isExternal}
      size={ButtonSize.Lg}
      width={BlockSize.Full}
      endIconName={endIconName ? IconName.Arrow2UpRight : undefined}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};
