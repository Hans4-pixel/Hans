import EventEmitter from 'events';
import { ObservableStore } from '@metamask/obs-store';
import log from 'loglevel';
import {
  MessageManager,
  MessageParamsMetamask,
  PersonalMessageManager,
  PersonalMessageParamsMetamask,
  TypedMessageManager,
  TypedMessageParamsMetamask,
} from '@metamask/message-manager';
import { ethErrors } from 'eth-rpc-errors';
import { bufferToHex } from 'ethereumjs-util';
import { KeyringController } from '@metamask/eth-keyring-controller';
import {
  AbstractMessageManager,
  AbstractMessage,
  MessageManagerState,
  AbstractMessageParams,
  AbstractMessageParamsMetamask,
  OriginalRequest,
} from '@metamask/message-manager/dist/AbstractMessageManager';
import PreferencesController from './preferences';

const INITIAL_STATE = {
  unapprovedMsgs: {},
  unapprovedPersonalMsgs: {},
  unapprovedTypedMessages: {},
  unapprovedMsgCount: 0,
  unapprovedPersonalMsgCount: 0,
  unapprovedTypedMessagesCount: 0,
};

interface Message<P extends AbstractMessageParams> extends AbstractMessage {
  messageParams: P;
}

export default class SignController extends EventEmitter {
  private keyringController: KeyringController;

  private preferencesController: PreferencesController;

  private sendUpdate: () => void;

  private showPopup: () => void;

  private getState: () => any;

  private memStore: ObservableStore;

  private messageManager: MessageManager;

  private personalMessageManager: PersonalMessageManager;

  private typedMessageManager: TypedMessageManager;

  private messageManagers: AbstractMessageManager<any, any, any>[];

  constructor({
    keyringController,
    preferencesController,
    sendUpdate,
    showPopup,
    getState,
  }: {
    keyringController: KeyringController;
    preferencesController: PreferencesController;
    sendUpdate: () => void;
    showPopup: () => void;
    getState: () => any;
  }) {
    super();

    this.keyringController = keyringController;
    this.preferencesController = preferencesController;
    this.sendUpdate = sendUpdate;
    this.showPopup = showPopup;
    this.getState = getState;

    this.memStore = new ObservableStore(INITIAL_STATE);

    this.messageManager = new MessageManager();
    this.personalMessageManager = new PersonalMessageManager();
    this.typedMessageManager = new TypedMessageManager();

    this.messageManagers = [
      this.messageManager,
      this.personalMessageManager,
      this.typedMessageManager,
    ];

    this.messageManagers.forEach((messageManager) =>
      this.bubbleEvents(messageManager),
    );

    this.subscribeToMessageState(
      this.messageManager,
      'unapprovedMsgs',
      'unapprovedMsgCount',
    );
    this.subscribeToMessageState(
      this.personalMessageManager,
      'unapprovedPersonalMsgs',
      'unapprovedPersonalMsgCount',
    );
    this.subscribeToMessageState(
      this.typedMessageManager,
      'unapprovedTypedMessages',
      'unapprovedTypedMessagesCount',
    );
  }

  /**
   * A getter for the number of 'unapproved' Messages in this.messages
   *
   * @returns The number of 'unapproved' Messages in this.messages
   */
  get unapprovedMsgCount(): number {
    return this.messageManager.getUnapprovedMessagesCount();
  }

  get unapprovedPersonalMessagesCount(): number {
    return this.personalMessageManager.getUnapprovedMessagesCount();
  }

  get unapprovedTypedMessagesCount(): number {
    return this.typedMessageManager.getUnapprovedMessagesCount();
  }

  resetState() {
    this.memStore.updateState(INITIAL_STATE);
  }

  /**
   * Called when a Dapp uses the eth_sign method, to request user approval.
   * eth_sign is a pure signature of arbitrary data. It is on a deprecation
   * path, since this data can be a transaction, or can leak private key
   * information.
   *
   * @param msgParams - The params passed to eth_sign.
   * @param [req] - The original request, containing the origin.
   */
  async newUnsignedMessage(
    msgParams: MessageParamsMetamask,
    req: OriginalRequest,
  ) {
    const {
      // eslint-disable-next-line camelcase
      disabledRpcMethodPreferences: { eth_sign },
    } = this.preferencesController.store.getState() as any;

    // eslint-disable-next-line camelcase
    if (!eth_sign) {
      throw ethErrors.rpc.methodNotFound(
        'eth_sign has been disabled. You must enable it in the advanced settings',
      );
    }

    const data = this.normalizeMsgData(msgParams.data);

    // 64 hex + "0x" at the beginning
    // This is needed because Ethereum's EcSign works only on 32 byte numbers
    // For 67 length see: https://github.com/MetaMask/metamask-extension/pull/12679/files#r749479607
    if (data.length === 66 || data.length === 67) {
      const promise = this.messageManager.addUnapprovedMessageAsync(
        msgParams,
        req,
      );
      this.sendUpdate();
      this.showPopup();
      return await promise;
    }

    throw ethErrors.rpc.invalidParams('eth_sign requires 32 byte message hash');
  }

  /**
   * Called when a dapp uses the personal_sign method.
   * This is identical to the Geth eth_sign method, and may eventually replace
   * eth_sign.
   *
   * We currently define our eth_sign and personal_sign mostly for legacy Dapps.
   *
   * @param msgParams - The params of the message to sign & return to the Dapp.
   * @param [req] - The original request, containing the origin.
   */
  async newUnsignedPersonalMessage(
    msgParams: PersonalMessageParamsMetamask,
    req: OriginalRequest,
  ) {
    const promise = this.personalMessageManager.addUnapprovedMessageAsync(
      msgParams,
      req,
    );
    this.sendUpdate();
    this.showPopup();
    return promise;
  }

  async newUnsignedTypedMessage(
    msgParams: TypedMessageParamsMetamask,
    req: OriginalRequest,
    version: string,
  ) {
    const promise = this.typedMessageManager.addUnapprovedMessageAsync(
      msgParams,
      version,
      req,
    );
    this.sendUpdate();
    this.showPopup();
    return promise;
  }

  /**
   * Signifies user intent to complete an eth_sign method.
   *
   * @param msgParams - The params passed to eth_call.
   * @returns Full state update.
   */
  async signMessage(msgParams: MessageParamsMetamask) {
    return await this.signAbstractMessage(
      this.messageManager,
      'signMessage',
      msgParams,
      async (cleanMsgParams) =>
        await this.keyringController.signMessage(cleanMsgParams),
    );
  }

  /**
   * Signifies a user's approval to sign a personal_sign message in queue.
   * Triggers signing, and the callback function from newUnsignedPersonalMessage.
   *
   * @param msgParams - The params of the message to sign & return to the Dapp.
   * @returns A full state update.
   */
  async signPersonalMessage(msgParams: PersonalMessageParamsMetamask) {
    return await this.signAbstractMessage(
      this.personalMessageManager,
      'signPersonalMessage',
      msgParams,
      async (cleanMsgParams) =>
        await this.keyringController.signPersonalMessage(cleanMsgParams),
    );
  }

  async signTypedMessage(msgParams: TypedMessageParamsMetamask) {
    const { version } = msgParams;

    return await this.signAbstractMessage(
      this.typedMessageManager,
      'eth_signTypedData',
      msgParams,
      async (cleanMsgParams) => {
        // For some reason every version after V1 used stringified params.
        if (version !== 'V1') {
          // But we don't have to require that. We can stop suggesting it now:
          if (typeof cleanMsgParams.data === 'string') {
            cleanMsgParams.data = JSON.parse(cleanMsgParams.data);
          }
        }

        return await this.keyringController.signTypedMessage(cleanMsgParams, {
          version,
        });
      },
    );
  }

  /**
   * Used to cancel a message submitted via eth_sign.
   *
   * @param msgId - The id of the message to cancel.
   */
  cancelMessage(msgId: string) {
    this.cancelAbstractMessage(this.messageManager, msgId);
  }

  /**
   * Used to cancel a personal_sign type message.
   *
   * @param msgId - The ID of the message to cancel.
   */
  cancelPersonalMessage(msgId: string) {
    this.cancelAbstractMessage(this.personalMessageManager, msgId);
  }

  cancelTypedMessage(msgId: string) {
    this.cancelAbstractMessage(this.typedMessageManager, msgId);
  }

  rejectUnapproved() {
    this.messageManagers.forEach((messageManager) =>
      Object.keys(messageManager.getUnapprovedMessages()).forEach((messageId) =>
        messageManager.rejectMessage(messageId),
      ),
    );
  }

  private async signAbstractMessage<
    M extends AbstractMessage,
    P extends AbstractMessageParams,
    PM extends AbstractMessageParamsMetamask,
  >(
    messageManager: AbstractMessageManager<M, P, PM>,
    methodName: string,
    msgParams: PM,
    getSignature: (cleanMessageParams: P) => any,
  ) {
    log.info(`MetaMaskController - ${methodName}`);
    const messageId = msgParams.metamaskId as string;
    try {
      const cleanMessageParams = await messageManager.approveMessage(msgParams);
      const signature = await getSignature(cleanMessageParams);
      messageManager.setMessageStatusSigned(messageId, signature);
      return this.getState();
    } catch (error) {
      log.info(`MetaMaskController - ${methodName} failed.`, error);
      this.typedMessageManager.setMessageStatusErrored(
        messageId,
        String(error),
      );
      throw error;
    }
  }

  private cancelAbstractMessage<
    M extends AbstractMessage,
    P extends AbstractMessageParams,
    PM extends AbstractMessageParamsMetamask,
  >(messageManager: AbstractMessageManager<M, P, PM>, messageId: string) {
    messageManager.rejectMessage(messageId);
    return this.getState();
  }

  private bubbleEvents<
    M extends AbstractMessage,
    P extends AbstractMessageParams,
    PM extends AbstractMessageParamsMetamask,
  >(messageManager: AbstractMessageManager<M, P, PM>) {
    messageManager.hub.on('updateBadge', () => {
      this.emit('updateBadge');
    });
  }

  private subscribeToMessageState<
    M extends AbstractMessage,
    P extends AbstractMessageParams,
    PM extends AbstractMessageParamsMetamask,
  >(
    messageManager: AbstractMessageManager<M, P, PM>,
    messagesPropertyName: string,
    countPropertyName: string,
  ) {
    messageManager.subscribe((state: MessageManagerState<M>) => {
      this.memStore.updateState({
        [messagesPropertyName]: this.migrateMessages(
          state.unapprovedMessages as any,
        ),
        [countPropertyName]: state.unapprovedMessagesCount,
      });
    });
  }

  private migrateMessages<P extends AbstractMessageParams>(messages: {
    [messageId: string]: Message<P>;
  }): {
    [messageId: string]: any;
  } {
    // Core message managers use messageParams but frontend has lots of references to msgParams
    return Object.keys(messages).reduce(
      (result: { [messageId: string]: any }, messageId) => {
        const originalMessage = messages[messageId];
        result[messageId] = {
          ...originalMessage,
          msgParams: originalMessage.messageParams,
        };
        return result;
      },
      {},
    );
  }

  private normalizeMsgData(data: string) {
    if (data.slice(0, 2) === '0x') {
      // data is already hex
      return data;
    }
    // data is unicode, convert to hex
    return bufferToHex(Buffer.from(data, 'utf8'));
  }
}
