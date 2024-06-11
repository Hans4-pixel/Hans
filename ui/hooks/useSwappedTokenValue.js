import { useSelector } from 'react-redux';
import { TransactionType } from '@metamask/transaction-controller';
import { getSwapsTokensReceivedFromTxMeta } from '../../shared/lib/transactions-controller-utils';
import {
  isSwapsDefaultTokenAddress,
  isSwapsDefaultTokenSymbol,
} from '../../shared/modules/swaps.utils';
import { getCurrentChainId } from '../selectors';
import { useTokenFiatAmount } from './useTokenFiatAmount';

/**
 * @typedef {object} SwappedTokenValue
 * @property {string} swapTokenValue - a primary currency string formatted for display
 * @property {string} swapTokenFiatAmount - a secondary currency string formatted for display
 * @property {boolean} isViewingReceivedTokenFromSwap - true if user is on the asset page for the
 *                                                      destination/received asset in a swap.
 */

/**
 * A Swap transaction group's primaryTransaction contains details of the swap,
 * including the source (from) and destination (to) token type (ETH, DAI, etc..)
 * When viewing an asset page that is not for the current chain's default token, we
 * need to determine if that asset is the token that was received (destination) from
 * the swap. In that circumstance we would want to show the primaryCurrency in the
 * activity list that is most relevant for that token (- 1000 DAI, for example, when
 * swapping DAI for ETH).
 *
 * @param {import('../selectors').transactionGroup} transactionGroup - Group of transactions by nonce
 * @param {import('./useTokenDisplayValue').Token} currentAsset - The current asset the user is looking at
 * @returns {SwappedTokenValue}
 */
export function useSwappedTokenValue(transactionGroup, currentAsset) {
  const { symbol, decimals, address } = currentAsset;
  const { primaryTransaction, initialTransaction } = transactionGroup;
  const { type } = initialTransaction;
  const { from: senderAddress } = initialTransaction.txParams || {};
  const chainId = useSelector(getCurrentChainId);

  const isViewingReceivedTokenFromSwap =
    currentAsset?.symbol === primaryTransaction.destinationTokenSymbol ||
    (isSwapsDefaultTokenAddress(currentAsset.address, chainId) &&
      isSwapsDefaultTokenSymbol(
        primaryTransaction.destinationTokenSymbol,
        chainId,
      ));

  const swapTokenValue =
    [TransactionType.swap].includes(type) && isViewingReceivedTokenFromSwap
      ? getSwapsTokensReceivedFromTxMeta(
          primaryTransaction.destinationTokenSymbol,
          initialTransaction,
          address,
          senderAddress,
          decimals,
          null,
          chainId,
        )
      : [TransactionType.swap, TransactionType.swapAndSend].includes(type) &&
        primaryTransaction.swapTokenValue;

  const isNegative =
    typeof swapTokenValue === 'string'
      ? Math.sign(swapTokenValue) === -1
      : false;

  const _swapTokenFiatAmount = useTokenFiatAmount(
    address,
    swapTokenValue || '',
    symbol,
  );
  const swapTokenFiatAmount =
    swapTokenValue && isViewingReceivedTokenFromSwap && _swapTokenFiatAmount;
  return {
    swapTokenValue,
    swapTokenFiatAmount,
    isViewingReceivedTokenFromSwap,
    isNegative,
  };
}
