import React from 'react';
import { AccountListItemMenu } from './account-list-item-menu';

export default {
  title: 'Components/Multichain/AccountListItemMenu',
  component: AccountListItemMenu,
  argTypes: {
    anchorElement: {
      control: 'window.Element',
    },
    onClose: {
      action: 'onClose',
    },
    blockExplorerUrlSubTitle: {
      control: 'text',
    },
    isRemovable: {
      control: 'boolean',
    },
    identity: {
      control: 'object',
    },
  },
  args: {
    anchorElement: null,
    identity: {
      address: '0x12C7...135f',
      name: 'Account 1',
      balance: '0x152387ad22c3f0',
      tokenBalance: '32.09 ETH',
    },
    isRemovable: true,
  },
};

export const DefaultStory = (args) => <AccountListItemMenu {...args} />;
DefaultStory.storyName = 'Default';
