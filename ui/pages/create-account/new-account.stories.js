import React from 'react';
import { action } from '@storybook/addon-actions';
import NewAccountCreateForm from './new-account.component';

export default {
  title: 'Pages/CreateAccount/NewAccount',
  id: __filename,
};

export const Base = () => {
  return <NewAccountCreateForm createAccount={action('Account Created')} />;
};
