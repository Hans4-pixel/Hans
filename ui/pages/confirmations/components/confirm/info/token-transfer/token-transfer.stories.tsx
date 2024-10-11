import React from 'react';
import { Provider } from 'react-redux';
import { getMockTokenTransferConfirmState } from '../../../../../../../test/data/confirmations/helper';
import configureStore from '../../../../../../store/store';
import { ConfirmContextProvider } from '../../../../context/confirm';
import TokenTransferInfo from './token-transfer';

const store = configureStore(getMockTokenTransferConfirmState({}));

const Story = {
  title: 'Components/App/Confirm/info/TokenTransferInfo',
  component: TokenTransferInfo,
  decorators: [
    (story: () => any) => (
      <Provider store={store}>
        <ConfirmContextProvider>{story()}</ConfirmContextProvider>
      </Provider>
    ),
  ],
};

export default Story;

export const DefaultStory = () => <TokenTransferInfo />;

DefaultStory.storyName = 'Default';
