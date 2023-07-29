import { hasProperty, Hex, isObject, isStrictHexString } from '@metamask/utils';
import { BN } from 'ethereumjs-util';

/**
 * Deletes properties of `NftController.allNftContracts`, `NftController.allNfts`,
 * `TokenListController.tokensChainsCache`, `TokensController.allTokens`,
 * `TokensController.allIgnoredTokens` and `TokensController.allDetectedTokens` if
 * their keyed by decimal number chainId and another hexadecimal chainId property
 * exists within the same object.
 * Further explanation in ./077-supplements.md
 *
 * @param state - The persisted MetaMask state, keyed by controller.
 * @returns Updated versioned MetaMask extension state.
 */
export default function transformState077For086(
  state: Record<string, unknown>,
): void {
  if (hasProperty(state, 'NftController') && isObject(state.NftController)) {
    const nftControllerState = state.NftController;

    // Migrate NftController.allNftContracts
    if (
      hasProperty(nftControllerState, 'allNftContracts') &&
      isObject(nftControllerState.allNftContracts)
    ) {
      const { allNftContracts } = nftControllerState;

      if (
        Object.keys(allNftContracts).every((address) =>
          isObject(allNftContracts[address]),
        )
      ) {
        Object.keys(allNftContracts).forEach((address) => {
          if (isObject(allNftContracts[address])) {
            const nftContractsByChainId = allNftContracts[address];
            for (const chainId of Object.keys(nftContractsByChainId)) {
              if (
                !isStrictHexString(chainId) &&
                nftContractsByChainId[toHex(chainId)]
              ) {
                delete allNftContracts[address][chainId];
              }
            }
          }
        });
      }
    }

    // Migrate NftController.allNfts
    if (
      hasProperty(nftControllerState, 'allNfts') &&
      isObject(nftControllerState.allNfts)
    ) {
      const { allNfts } = nftControllerState;

      if (Object.keys(allNfts).every((address) => isObject(allNfts[address]))) {
        Object.keys(allNfts).forEach((address) => {
          if (isObject(allNfts[address])) {
            const nftsByChainId = allNfts[address];
            for (const chainId of Object.keys(nftsByChainId)) {
              if (
                !isStrictHexString(chainId) &&
                nftsByChainId[toHex(chainId)]
              ) {
                delete allNfts[address][chainId];
              }
            }
          }
        });
      }
    }

    state.NftController = nftControllerState;
  }

  if (
    hasProperty(state, 'TokenListController') &&
    isObject(state.TokenListController)
  ) {
    const tokenListControllerState = state.TokenListController;

    // Migrate TokenListController.tokensChainsCache
    if (
      hasProperty(tokenListControllerState, 'tokensChainsCache') &&
      isObject(tokenListControllerState.tokensChainsCache)
    ) {
      for (const chainId of Object.keys(
        tokenListControllerState.tokensChainsCache,
      )) {
        if (
          !isStrictHexString(chainId) &&
          tokenListControllerState.tokensChainsCache[toHex(chainId)]
        ) {
          delete tokenListControllerState.tokensChainsCache[chainId];
        }
      }
    }
  }

  if (
    hasProperty(state, 'TokensController') &&
    isObject(state.TokensController)
  ) {
    const tokensControllerState = state.TokensController;

    // Migrate TokensController.allTokens
    if (
      hasProperty(tokensControllerState, 'allTokens') &&
      isObject(tokensControllerState.allTokens)
    ) {
      const { allTokens } = tokensControllerState;

      for (const chainId of Object.keys(allTokens)) {
        if (!isStrictHexString(chainId) && allTokens[toHex(chainId)]) {
          delete tokensControllerState.allTokens[chainId];
        }
      }
    }

    // Migrate TokensController.allIgnoredTokens
    if (
      hasProperty(tokensControllerState, 'allIgnoredTokens') &&
      isObject(tokensControllerState.allIgnoredTokens)
    ) {
      const { allIgnoredTokens } = tokensControllerState;

      for (const chainId of Object.keys(allIgnoredTokens)) {
        if (!isStrictHexString(chainId) && allIgnoredTokens[toHex(chainId)]) {
          delete tokensControllerState.allIgnoredTokens[chainId];
        }
      }
    }

    // Migrate TokensController.allDetectedTokens
    if (
      hasProperty(tokensControllerState, 'allDetectedTokens') &&
      isObject(tokensControllerState.allDetectedTokens)
    ) {
      const { allDetectedTokens } = tokensControllerState;

      for (const chainId of Object.keys(allDetectedTokens)) {
        if (!isStrictHexString(chainId) && allDetectedTokens[toHex(chainId)]) {
          delete tokensControllerState.allDetectedTokens[chainId];
        }
      }
    }

    state.TokensController = tokensControllerState;
  }
  return state;
}

function toHex(value: number | string | BN): Hex {
  if (typeof value === 'string' && isStrictHexString(value)) {
    return value;
  }
  const hexString = BN.isBN(value)
    ? value.toString(16)
    : new BN(value.toString(), 10).toString(16);
  return `0x${hexString}`;
}
