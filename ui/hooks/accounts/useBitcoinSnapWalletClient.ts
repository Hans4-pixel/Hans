import { KeyringClient, Sender } from '@metamask/keyring-api';
import { HandlerType } from '@metamask/snaps-utils';
import { CaipChainId, Json, JsonRpcRequest } from '@metamask/utils';
import { useMemo } from 'react';
import { handleSnapRequest } from '../../store/actions';
import { BITCOIN_WALLET_SNAP_ID } from '../../../shared/lib/accounts/bitcoin-wallet-snap';

export class BitcoinWalletSnapSender implements Sender {
  send = async (request: JsonRpcRequest): Promise<Json> => {
    // We assume the caller of this module is aware of this. If we try to use this module
    // without having the pre-installed Snap, this will likely throw an error in
    // the `handleSnapRequest` action.
    return (await handleSnapRequest({
      origin: 'metamask',
      snapId: BITCOIN_WALLET_SNAP_ID,
      handler: HandlerType.OnKeyringRequest,
      request,
    })) as Json;
  };
}

export class BitcoinWalletSnapClient {
  readonly #client: KeyringClient;

  constructor() {
    this.#client = new KeyringClient(new BitcoinWalletSnapSender());
  }

  async createAccount(scope: CaipChainId) {
    // This will trigger the Snap account creation flow (+ account renaming)
    return await this.#client.createAccount({
      scope,
    });
  }
}

export function useBitcoinSnapWalletClient() {
  const client = useMemo(() => {
    return new BitcoinWalletSnapClient();
  }, []);

  return client;
}
