import { ethErrors } from 'eth-rpc-errors';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';
import {
  validateSwitchEthereumChainParams,
  switchChain,
} from './ethereum-chain-utils';

const switchEthereumChain = {
  methodNames: [MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN],
  implementation: switchEthereumChainHandler,
  hookNames: {
    getNetworkConfigurationByChainId: true,
    setActiveNetwork: true,
    getCaveat: true,
    requestPermittedChainsPermission: true,
    getCurrentChainIdForDomain: true,
    requestUserApproval: true,
    getChainPermissionsFeatureFlag: true,
  },
};

export default switchEthereumChain;

async function switchEthereumChainHandler(
  req,
  res,
  _next,
  end,
  {
    getNetworkConfigurationByChainId,
    setActiveNetwork,
    requestPermittedChainsPermission,
    getCaveat,
    getCurrentChainIdForDomain,
    requestUserApproval,
    getChainPermissionsFeatureFlag,
  },
) {
  let chainId;
  try {
    chainId = validateSwitchEthereumChainParams(req, end);
  } catch (error) {
    return end(error);
  }

  const { origin } = req;
  const currentChainIdForOrigin = getCurrentChainIdForDomain(origin);
  if (currentChainIdForOrigin === chainId) {
    res.result = null;
    return end();
  }

  const networkConfigurationForRequestedChainId =
    getNetworkConfigurationByChainId(chainId);
  const networkClientIdToSwitchTo =
    networkConfigurationForRequestedChainId.rpcEndpoints[
      networkConfigurationForRequestedChainId.defaultRpcEndpointIndex
    ].networkClientId;

  if (!networkClientIdToSwitchTo) {
    return end(
      ethErrors.provider.custom({
        code: 4902,
        message: `Unrecognized chain ID "${chainId}". Try adding the chain using ${MESSAGE_TYPE.ADD_ETHEREUM_CHAIN} first.`,
      }),
    );
  }

  const requestData = {
    toNetworkConfiguration: networkConfigurationForRequestedChainId,
    fromNetworkConfiguration: getNetworkConfigurationByChainId(
      currentChainIdForOrigin,
    ),
  };

  return switchChain(
    res,
    end,
    origin,
    chainId,
    requestData,
    networkClientIdToSwitchTo,
    null,
    {
      getChainPermissionsFeatureFlag,
      setActiveNetwork,
      requestUserApproval,
      getCaveat,
      requestPermittedChainsPermission,
    },
  );
}
