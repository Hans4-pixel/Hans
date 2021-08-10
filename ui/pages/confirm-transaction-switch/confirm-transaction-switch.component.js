import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import Loading from '../../components/ui/loading-screen';
import {
  CONFIRM_TRANSACTION_ROUTE,
  CONFIRM_DEPLOY_CONTRACT_PATH,
  CONFIRM_SEND_ETHER_PATH,
  CONFIRM_SEND_TOKEN_PATH,
  CONFIRM_APPROVE_PATH,
  CONFIRM_TRANSFER_FROM_PATH,
  CONFIRM_TOKEN_METHOD_PATH,
  SIGNATURE_REQUEST_PATH,
  DECRYPT_MESSAGE_REQUEST_PATH,
  ENCRYPTION_PUBLIC_KEY_REQUEST_PATH,
} from '../../helpers/constants/routes';
import { MESSAGE_TYPE } from '../../../shared/constants/app';
import { TRANSACTION_TYPES } from '../../../shared/constants/transaction';

export default class ConfirmTransactionSwitch extends Component {
  static propTypes = {
    txData: PropTypes.object,
  };

  redirectToTransaction() {
    const { txData } = this.props;
    const { id, txParams: { data } = {}, type } = txData;

    if (type === TRANSACTION_TYPES.DEPLOY_CONTRACT) {
      const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_DEPLOY_CONTRACT_PATH}`;
      return <Redirect to={{ pathname }} />;
    }

    if (
      type === TRANSACTION_TYPES.SENDING_NATIVE_ASSET ||
      type === TRANSACTION_TYPES.SENT_ETHER
    ) {
      const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_SEND_ETHER_PATH}`;
      return <Redirect to={{ pathname }} />;
    }

    if (data) {
      switch (type) {
        case TRANSACTION_TYPES.TOKEN_METHOD_TRANSFER: {
          const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_SEND_TOKEN_PATH}`;
          return <Redirect to={{ pathname }} />;
        }
        case TRANSACTION_TYPES.TOKEN_METHOD_APPROVE: {
          const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_APPROVE_PATH}`;
          return <Redirect to={{ pathname }} />;
        }
        case TRANSACTION_TYPES.TOKEN_METHOD_TRANSFER_FROM: {
          const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_TRANSFER_FROM_PATH}`;
          return <Redirect to={{ pathname }} />;
        }
        default: {
          const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_TOKEN_METHOD_PATH}`;
          return <Redirect to={{ pathname }} />;
        }
      }
    }

    const pathname = `${CONFIRM_TRANSACTION_ROUTE}/${id}${CONFIRM_SEND_ETHER_PATH}`;
    return <Redirect to={{ pathname }} />;
  }

  render() {
    const { txData } = this.props;
    if (txData.txParams) {
      return this.redirectToTransaction();
    } else if (txData.msgParams) {
      let pathname = `${CONFIRM_TRANSACTION_ROUTE}/${txData.id}${SIGNATURE_REQUEST_PATH}`;
      if (txData.type === MESSAGE_TYPE.ETH_DECRYPT) {
        pathname = `${CONFIRM_TRANSACTION_ROUTE}/${txData.id}${DECRYPT_MESSAGE_REQUEST_PATH}`;
      } else if (txData.type === MESSAGE_TYPE.ETH_GET_ENCRYPTION_PUBLIC_KEY) {
        pathname = `${CONFIRM_TRANSACTION_ROUTE}/${txData.id}${ENCRYPTION_PUBLIC_KEY_REQUEST_PATH}`;
      }
      return <Redirect to={{ pathname }} />;
    }

    return <Loading />;
  }
}
