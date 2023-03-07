import React from 'react';
import { AccountListMenu } from './account-list-menu';

const SampleIdentity = {
  address: '0x12C7...135f',
  name: 'Account 1',
  balance: '0x152387ad22c3f0',
  tokenBalance: '32.09 ETH',
};

const ChaosIdentity = {
  address: '0x12C7...135f',
  name: 'pneumonoultramicroscopicsilicovolcanoconiosis',
  balance: '0x152387ad22c3f0',
  tokenBalance: '3,299.09 ETH',
};

export default {
  title: 'Components/Multichain/AccountListMenu',
  component: AccountListMenu,
};

export const DefaultStory = () => (
  <AccountListMenu
    identities={[
      SampleIdentity,
      ChaosIdentity,
      SampleIdentity,
      ChaosIdentity,
      SampleIdentity,
      ChaosIdentity,
    ]}
  />
);
