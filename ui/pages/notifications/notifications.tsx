import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useI18nContext } from '../../hooks/useI18nContext';
import {
  IconName,
  ButtonIcon,
  ButtonIconSize,
} from '../../components/component-library';
import { Tabs, Tab } from '../../components/ui/tabs';
import {
  DEFAULT_ROUTE,
  NOTIFICATIONS_SETTINGS_ROUTE,
} from '../../helpers/constants/routes';
import { NotificationsPage } from '../../components/multichain';
import { Content, Header } from '../../components/multichain/pages/page';
import { useMetamaskNotificationsContext } from '../../contexts/metamask-notifications/metamask-notifications';
import { getNotifications } from '../../selectors';
import {
  selectIsMetamaskNotificationsFeatureSeen,
  selectIsSnapNotificationsEnabled,
} from '../../selectors/metamask-notifications/metamask-notifications';
import type { Notification } from '../../../app/scripts/controllers/metamask-notifications/types/notification/notification';
import { deleteExpiredNotifications } from '../../store/actions';
import { NotificationsList } from './notifications-list';
import { processSnapNotifications } from './snap/utils/utils';
import { SnapNotificationWithoutSnapName } from './snap/types/types';

export type NotificationType = Notification | SnapNotificationWithoutSnapName;

export default function Notifications() {
  const dispatch = useDispatch();
  const history = useHistory();
  const t = useI18nContext();
  const { notificationsData, listNotifications } =
    useMetamaskNotificationsContext();

  const snapNotifications = useSelector(getNotifications);
  const isMetamaskNotificationsFeatureSeen = useSelector(
    selectIsMetamaskNotificationsFeatureSeen,
  );
  const isSnapNotificationsEnabled = useSelector(
    selectIsSnapNotificationsEnabled,
  );

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('notifications');

  useEffect(() => {
    return () => {
      dispatch(deleteExpiredNotifications());
    };
  }, [dispatch]);

  useEffect(() => {
    let snaps;
    if (isSnapNotificationsEnabled && snapNotifications) {
      snaps = processSnapNotifications(snapNotifications);
    }
    const combinedNotifications = [
      ...(notificationsData || []),
      ...(snaps || []),
    ];
    combinedNotifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setNotifications(combinedNotifications);
  }, [notificationsData, snapNotifications]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const renderActiveTabContent = () => {
    return (
      <NotificationsList activeTab={activeTab} notifications={notifications} />
    );
  };

  if (!isMetamaskNotificationsFeatureSeen) {
    history.push(DEFAULT_ROUTE);
  }

  return (
    <NotificationsPage>
      <Header
        startAccessory={
          <ButtonIcon
            ariaLabel="Back"
            iconName={IconName.ArrowLeft}
            size={ButtonIconSize.Sm}
            onClick={() => {
              listNotifications();
              history.push(DEFAULT_ROUTE);
            }}
            data-testid="back-button"
          />
        }
        children={t('notifications')}
        endAccessory={
          <ButtonIcon
            ariaLabel="Notifications Settings"
            iconName={IconName.Setting}
            size={ButtonIconSize.Sm}
            onClick={() => {
              history.push(NOTIFICATIONS_SETTINGS_ROUTE);
            }}
            data-testid="notifications-settings-button"
          />
        }
        marginBottom={0}
      />
      <Content paddingLeft={0} paddingRight={0}>
        <Tabs
          defaultActiveTabKey={activeTab}
          onTabClick={handleTabClick}
          tabsClassName="notifications__tabs"
        >
          <Tab
            activeClassName="notifications__tab--active"
            className="notifications__tab"
            data-testid="notifications-all-tab"
            name={t('all')}
            tabKey="notifications-all-tab"
          />
          <Tab
            activeClassName="notifications__tab--active"
            className="notifications__tab"
            data-testid="notifications-wallet-tab"
            name={t('wallet')}
            tabKey="notifications-wallet-tab"
          />
          <Tab
            activeClassName="notifications__tab--active"
            className="notifications__tab"
            data-testid="notifications-other-tab"
            name={t('other')}
            tabKey="notifications-other-tab"
          />
        </Tabs>
        {renderActiveTabContent()}
      </Content>
    </NotificationsPage>
  );
}
