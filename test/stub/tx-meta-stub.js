import { GAS_LIMITS } from '../../shared/constants/gas';
import {
  TransactionStatus,
  TransactionType,
} from '../../shared/constants/transaction';

export const txMetaStub = {
  firstRetryBlockNumber: '0x51a402',
  hash: '0x2cc5a25744486f7383edebbf32003e5a66e18135799593d6b5cdd2bb43674f09',
  history: [
    {
      id: 405984854664302,
      loadingDefaults: true,
      chainId: '0x5',
      status: TransactionStatus.unapproved,
      time: 1572395156620,
      type: TransactionType.simpleSend,
      txParams: {
        from: '0xf231d46dd78806e1dd93442cf33c7671f8538748',
        gas: GAS_LIMITS.SIMPLE,
        gasPrice: '0x1e8480',
        to: '0xf231d46dd78806e1dd93442cf33c7671f8538748',
        value: '0x0',
      },
    },
    [
      {
        op: 'replace',
        path: '/loadingDefaults',
        timestamp: 1572395156645,
        value: false,
      },
    ],
    [
      {
        note: '#newUnapprovedTransaction - adding the origin',
        op: 'add',
        path: '/origin',
        timestamp: 1572395156645,
        value: 'MetaMask',
      },
    ],
    [],
    [
      {
        note: 'txStateManager: setting status to approved',
        op: 'replace',
        path: '/status',
        timestamp: 1572395158240,
        value: TransactionStatus.approved,
      },
    ],
    [
      {
        note: 'transactions#approveTransaction',
        op: 'add',
        path: '/txParams/nonce',
        timestamp: 1572395158261,
        value: '0x5',
      },
    ],
    [
      {
        note: 'transactions#signTransaction: add r, s, v values',
        op: 'add',
        path: '/r',
        timestamp: 1572395158280,
        value:
          '0x5f973e540f2d3c2f06d3725a626b75247593cb36477187ae07ecfe0a4db3cf57',
      },
      {
        op: 'add',
        path: '/s',
        value:
          '0x0259b52ee8c58baaa385fb05c3f96116e58de89bcc165cb3bfdfc708672fed8a',
      },
      {
        op: 'add',
        path: '/v',
        value: '0x2c',
      },
    ],
    [
      {
        note: 'transactions#publishTransaction',
        op: 'replace',
        path: '/status',
        timestamp: 1572395158281,
        value: TransactionStatus.signed,
      },
      {
        op: 'add',
        path: '/rawTx',
        value:
          '0xf86204831e848082520894f231d46dd78806e1dd93442cf33c7671f853874880802ca05f973e540f2d3c2f06d3725a626b75247593cb36477187ae07ecfe0a4db3cf57a00259b52ee8c58baaa385fb05c3f96116e58de89bcc165cb3bfdfc708672fed8a',
      },
    ],
    [],
    [
      {
        note: 'transactions#setTxHash',
        op: 'add',
        path: '/hash',
        timestamp: 1572395158570,
        value:
          '0x2cc5a25744486f7383edebbf32003e5a66e18135799593d6b5cdd2bb43674f09',
      },
    ],
    [
      {
        note: 'txStateManager - add submitted time stamp',
        op: 'add',
        path: '/submittedTime',
        timestamp: 1572395158571,
        value: 1572395158570,
      },
    ],
    [
      {
        note: 'txStateManager: setting status to submitted',
        op: 'replace',
        path: '/status',
        timestamp: 1572395158576,
        value: TransactionStatus.submitted,
      },
    ],
    [
      {
        note: 'transactions/pending-tx-tracker#event: tx:block-update',
        op: 'add',
        path: '/firstRetryBlockNumber',
        timestamp: 1572395168972,
        value: '0x51a402',
      },
    ],
  ],
  id: 405984854664302,
  loadingDefaults: false,
  origin: 'MetaMask',
  r: '0x5f973e540f2d3c2f06d3725a626b75247593cb36477187ae07ecfe0a4db3cf57',
  rawTx:
    '0xf86204831e848082520894f231d46dd78806e1dd93442cf33c7671f853874880802ca05f973e540f2d3c2f06d3725a626b75247593cb36477187ae07ecfe0a4db3cf57a00259b52ee8c58baaa385fb05c3f96116e58de89bcc165cb3bfdfc708672fed8a',
  s: '0x0259b52ee8c58baaa385fb05c3f96116e58de89bcc165cb3bfdfc708672fed8a',
  status: TransactionStatus.submitted,
  submittedTime: 1572395158570,
  time: 1572395156620,
  type: TransactionType.simpleSend,
  txParams: {
    from: '0xf231d46dd78806e1dd93442cf33c7671f8538748',
    gas: GAS_LIMITS.SIMPLE,
    gasPrice: '0x1e8480',
    nonce: '0x5',
    to: '0xf231d46dd78806e1dd93442cf33c7671f8538748',
    value: '0x0',
  },
  v: '0x2c',
};
