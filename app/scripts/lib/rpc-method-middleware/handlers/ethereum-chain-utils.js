import { errorCodes, ethErrors } from 'eth-rpc-errors';
import {
  BUILT_IN_INFURA_NETWORKS,
  CHAIN_ID_TO_RPC_URL_MAP,
  CHAIN_ID_TO_TYPE_MAP,
  CURRENCY_SYMBOLS,
  NETWORK_TO_NAME_MAP,
} from '../../../../../shared/constants/network';
import {
  isPrefixedFormattedHexString,
  isSafeChainId,
} from '../../../../../shared/modules/network.utils';
import { CaveatTypes } from '../../../../../shared/constants/permissions';
import { UNKNOWN_TICKER_SYMBOL } from '../../../../../shared/constants/app';
import { PermissionNames } from '../../../controllers/permissions';
import { getValidUrl } from '../../util';

export function findExistingNetwork(chainId, findNetworkConfigurationBy) {
  if (
    Object.values(BUILT_IN_INFURA_NETWORKS)
      .map(({ chainId: id }) => id)
      .includes(chainId)
  ) {
    return {
      chainId,
      ticker: CURRENCY_SYMBOLS.ETH,
      nickname: NETWORK_TO_NAME_MAP[chainId],
      rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[chainId],
      type: CHAIN_ID_TO_TYPE_MAP[chainId],
    };
  }
  return findNetworkConfigurationBy({ chainId });
}

export function validateChainId(chainId, end) {
  const _chainId = typeof chainId === 'string' && chainId.toLowerCase();

  if (!isPrefixedFormattedHexString(_chainId)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected 0x-prefixed, unpadded, non-zero hexadecimal string 'chainId'. Received:\n${chainId}`,
      }),
    );
  }

  if (!isSafeChainId(parseInt(_chainId, 16))) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Invalid chain ID "${_chainId}": numerical value greater than max safe value. Received:\n${chainId}`,
      }),
    );
  }

  return _chainId;
}

export function validateRequestParams(req, end) {
  if (!req.params?.[0] || typeof req.params[0] !== 'object') {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected single, object parameter. Received:\n${JSON.stringify(
          req.params,
        )}`,
      }),
    );
  }

  const { chainId } = req.params[0];
  return validateChainId(chainId, end);
}

export function validateAddEthereumChainParams(params, end) {
  if (!params || typeof params !== 'object') {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected single, object parameter. Received:\n${JSON.stringify(
          params,
        )}`,
      }),
    );
  }

  const {
    chainId,
    chainName,
    blockExplorerUrls,
    nativeCurrency,
    rpcUrls,
    ...otherParams
  } = params;

  if (Object.keys(otherParams).length > 0) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Received unexpected keys on object parameter. Unsupported keys:\n${Object.keys(
          otherParams,
        )}`,
      }),
    );
  }

  const _chainId = validateChainId(chainId, end);
  if (!_chainId) {
    return end();
  }
  if (!rpcUrls || !Array.isArray(rpcUrls) || rpcUrls.length === 0) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected an array with at least one valid string HTTPS url 'rpcUrls', Received:\n${rpcUrls}`,
      }),
    );
  }

  const isLocalhostOrHttps = (urlString) => {
    const url = getValidUrl(urlString);
    return (
      url !== null &&
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.protocol === 'https:')
    );
  };

  const firstValidRPCUrl = rpcUrls.find((rpcUrl) => isLocalhostOrHttps(rpcUrl));
  const firstValidBlockExplorerUrl =
    blockExplorerUrls !== null && Array.isArray(blockExplorerUrls)
      ? blockExplorerUrls.find((blockExplorerUrl) =>
          isLocalhostOrHttps(blockExplorerUrl),
        )
      : null;

  if (!firstValidRPCUrl) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected an array with at least one valid string HTTPS url 'rpcUrls', Received:\n${rpcUrls}`,
      }),
    );
  }

  if (blockExplorerUrls !== null && !firstValidBlockExplorerUrl) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected null or array with at least one valid string HTTPS URL 'blockExplorerUrl'. Received: ${blockExplorerUrls}`,
      }),
    );
  }

  if (typeof chainName !== 'string' || !chainName) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected non-empty string 'chainName'. Received:\n${chainName}`,
      }),
    );
  }

  const _chainName =
    chainName.length > 100 ? chainName.substring(0, 100) : chainName;

  if (nativeCurrency !== null) {
    if (typeof nativeCurrency !== 'object' || Array.isArray(nativeCurrency)) {
      return end(
        ethErrors.rpc.invalidParams({
          message: `Expected null or object 'nativeCurrency'. Received:\n${nativeCurrency}`,
        }),
      );
    }
    if (nativeCurrency.decimals !== 18) {
      return end(
        ethErrors.rpc.invalidParams({
          message: `Expected the number 18 for 'nativeCurrency.decimals' when 'nativeCurrency' is provided. Received: ${nativeCurrency.decimals}`,
        }),
      );
    }

    if (!nativeCurrency.symbol || typeof nativeCurrency.symbol !== 'string') {
      return end(
        ethErrors.rpc.invalidParams({
          message: `Expected a string 'nativeCurrency.symbol'. Received: ${nativeCurrency.symbol}`,
        }),
      );
    }
  }

  const ticker = nativeCurrency?.symbol || UNKNOWN_TICKER_SYMBOL;
  if (
    ticker !== UNKNOWN_TICKER_SYMBOL &&
    (typeof ticker !== 'string' || ticker.length < 2 || ticker.length > 6)
  ) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected 2-6 character string 'nativeCurrency.symbol'. Received:\n${ticker}`,
      }),
    );
  }

  return {
    chainId: _chainId,
    chainName: _chainName,
    firstValidBlockExplorerUrl,
    firstValidRPCUrl,
    ticker,
  };
}

export async function switchChain(
  res,
  end,
  origin,
  chainId,
  requestData,
  networkConfigurationId,
  approvalFlowId,
  {
    getChainPermissionsFeatureFlag,
    setActiveNetwork,
    endApprovalFlow,
    requestUserApproval,
    getCaveat,
    requestSwitchNetworkPermission,
  },
) {
  if (getChainPermissionsFeatureFlag()) {
    return await switchChainWithPermissions(
      res,
      end,
      chainId,
      networkConfigurationId,
      {
        getCaveat,
        requestSwitchNetworkPermission,
        setActiveNetwork,
        endApprovalFlow,
      },
    );
  }
  return await switchChainWithoutPermissions(
    res,
    end,
    requestData,
    networkConfigurationId,
    approvalFlowId,
    origin,
    { setActiveNetwork, endApprovalFlow, requestUserApproval },
  );
}

async function switchChainWithPermissions(
  res,
  end,
  chainId,
  networkClientIdToSwitchTo,
  {
    getCaveat,
    requestSwitchNetworkPermission,
    setActiveNetwork,
    endApprovalFlow,
  },
) {
  const { value: permissionedChainIds } =
    getCaveat({
      target: PermissionNames.permittedChains,
      caveatType: CaveatTypes.restrictNetworkSwitching,
    }) ?? {};

  if (
    permissionedChainIds === undefined ||
    !permissionedChainIds.includes(chainId)
  ) {
    try {
      await requestSwitchNetworkPermission([
        ...(permissionedChainIds ?? []),
        chainId,
      ]);
    } catch (err) {
      return end(err);
    }
  }

  try {
    await setActiveNetwork(networkClientIdToSwitchTo);
    res.result = null;
  } catch (error) {
    return end(
      error.code === errorCodes.provider.userRejectedRequest
        ? undefined
        : error,
    );
  } finally {
    if (approvalFlowId) {
      endApprovalFlow({ id: approvalFlowId });
    }
  }
  return end();
}

async function switchChainWithoutPermissions(
  res,
  end,
  requestData,
  networkClientIdToSwitchTo,
  approvalFlowId,
  origin,
  { setActiveNetwork, endApprovalFlow, requestUserApproval },
) {
  try {
    await requestUserApproval({
      origin,
      type: ApprovalType.SwitchEthereumChain,
      requestData,
    });

    await setActiveNetwork(networkClientIdToSwitchTo);
    res.result = null;
  } catch (error) {
    if (error.code !== errorCodes.provider.userRejectedRequest) {
      return end(error);
    }
  } finally {
    if (approvalFlowId) {
      endApprovalFlow({ id: approvalFlowId });
    }
  }
  return end();
}
