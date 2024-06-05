import { hashMessage } from '@ethersproject/hash';
import { verifyMessage } from '@ethersproject/wallet';
import {
  Json,
  JsonRpcParams,
  JsonRpcRequest,
  JsonRpcResponse,
  isObject,
} from '@metamask/utils';
import {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from 'json-rpc-engine';
import { SIG_LEN, TRUSTED_BRIDGE_SIGNER } from '../../../../shared/constants/bridge';
import { FIRST_PARTY_CONTRACT_NAMES } from '../../../../shared/constants/first-party-contracts';

export function txVerificationMiddleware(
  req: JsonRpcRequest<JsonRpcParams>,
  _res: JsonRpcResponse<Json>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
) {
  if (req.method !== 'eth_sendTransaction' || !Array.isArray(req.params) || isObject(req.params[0])) {
    return next();
  }

  // the tx object is the first element
  const params = req.params[0];
  const paramsToVerify = {
    to: hashMessage(params.to.toLowerCase()),
    from: hashMessage(params.from.toLowerCase()),
    data: hashMessage(
      // strip signature from data
      params.data.toLowerCase().substr(0, params.data.length - SIG_LEN),
    ),
    value: hashMessage(params.value.toLowerCase()),
  };
  const h = hashMessage(JSON.stringify(paramsToVerify));
  // signature is 130 chars in length at the end
  const signature = `0x${params.data.substr(-SIG_LEN)}`;
  const addressToVerify = verifyMessage(h, signature);

  const canSubmit =
    params.to.toLowerCase() ===
    FIRST_PARTY_CONTRACT_NAMES['MetaMask Bridge'][params.chainId].toLowerCase()
      ? addressToVerify.toLowerCase() === TRUSTED_BRIDGE_SIGNER.toLowerCase()
      : true;

  if (!canSubmit) {
    return end(new Error('Validation Error'));
  }
  return next();
}
