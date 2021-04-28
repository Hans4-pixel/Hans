// Messages and descriptions for these locale keys are in app/_locales/en/messages.json
export const UI_NOTIFICATIONS = {
  1: {
    id: 1,
    date: '2020-03-17',
    image: {
      src: 'images/mobile-link-qr.svg',
      height: '270px',
      width: '270px',
    },
  },
  2: {
    id: 2,
    date: '2020-03-17',
  },
  3: {
    id: 3,
    date: '2020-03-17',
  },
};

export const getTranslatedUINoficiations = (t) => {
  return {
    1: {
      ...UI_NOTIFICATIONS[1],
      title: t('notifications1Title'),
      description: t('notifications1Description'),
    },
    2: {
      ...UI_NOTIFICATIONS[2],
      title: t('notifications2Title'),
      description: t('notifications2Description'),
      actionText: t('notifications2ActionText'),
    },
    3: {
      ...UI_NOTIFICATIONS[3],
      title: t('notifications3Title'),
      description: t('notifications3Description'),
      actionText: t('notifications3ActionText'),
    },
  };
};
