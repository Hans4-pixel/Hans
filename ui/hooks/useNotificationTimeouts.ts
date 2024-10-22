import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { INotification } from '@metamask/notification-services-controller/notification-services';
import { deleteNotificationsById } from '../store/actions';
import { NOTIFICATIONS_EXPIRATION_DELAY } from '../helpers/constants/notifications';

export const useSnapNotificationTimeouts = (notifications: INotification[]) => {
  const timerMap = new Map<string, NodeJS.Timeout>();
  const dispatch = useDispatch();

  const setNotificationTimeout = (id: string) => {
    const timerId = setTimeout(async () => {
      await dispatch(deleteNotificationsById([id]));
    }, NOTIFICATIONS_EXPIRATION_DELAY);
    timerMap.set(id, timerId);
  };

  const clearTimeouts = () => {
    [...timerMap.keys()].forEach((id) => {
      if (!notifications.find((notification) => notification.id === id)) {
        clearTimeout(timerMap.get(id));
      }
    });
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  return { setNotificationTimeout };
};
