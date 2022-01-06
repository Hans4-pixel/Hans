import React, { useEffect } from 'react';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import {
  updateSendStage,
  updateSendAsset,
} from '../../../../.storybook/actions/sb-send-action';

import sendSBReducer from '../../../../.storybook/reducers/sb-send-reducer';
import historySBReducer from '../../../../.storybook/reducers/sb-history-reducer';

import { ASSET_TYPES, SEND_STAGES } from '../../../ducks/send';
import SendHeader from './send-header.component';

export default {
  title: 'Pages/Send/SendHeader',
  id: __filename,
  argsTypes: {
    asset: { control: 'select' },
    stage: { control: 'select' },
  },
};

const store = createStore(
  combineReducers({ send: sendSBReducer, history: historySBReducer }),
);
const state = store.getState();
const { send } = state;

export const DefaultStory = (args) => {
  useEffect(() => {
    store.dispatch(updateSendAsset(args.asset));
  }, [args.asset]);

  useEffect(() => {
    store.dispatch(updateSendStage(args.stage));
  }, [args.stage]);

  return (
    <Provider store={store}>
      <div style={{ width: 600 }}>
        <SendHeader {...args} />
      </div>
    </Provider>
  );
};

DefaultStory.storyName = 'Default';
DefaultStory.args = {
  asset: [ASSET_TYPES.NATIVE, ASSET_TYPES.TOKEN] || send.asset,
  stage:
    [
      SEND_STAGES.ADD_RECIPIENT,
      SEND_STAGES.DRAFT,
      SEND_STAGES.EDIT,
      SEND_STAGES.INACTIVE,
    ] || send.stage,
};
