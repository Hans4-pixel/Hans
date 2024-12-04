import { useSelector } from 'react-redux';
import { TransactionGroup } from '../../../hooks/bridge/useBridgeTxHistoryData';
import { getCurrentChainId } from '../../../../shared/modules/selectors/networks';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
import { TransactionGroupCategory } from '../../../../shared/constants/transaction';

/**
 * A Bridge transaction group's primaryTransaction contains details of the swap,
 * including the source (from) and destination (to) token type (ETH, DAI, etc..)
 */
export function useBridgeTokenDisplayData(transactionGroup: TransactionGroup) {
  const { primaryTransaction } = transactionGroup;
  const chainId = useSelector(getCurrentChainId);

  const tokenAmount = primaryTransaction.sourceTokenAmount
    ? calcTokenAmount(
        primaryTransaction.sourceTokenAmount,
        primaryTransaction.sourceTokenDecimals,
      ).toString()
    : undefined;

  // Display currency can be fiat or a token
  const displayCurrencyAmount = useTokenFiatAmount(
    primaryTransaction.sourceTokenAddress,
    tokenAmount,
    primaryTransaction.sourceTokenSymbol,
    {},
    true,
    chainId,
  );

  return {
    category: TransactionGroupCategory.bridge,
    displayCurrencyAmount,
    sourceTokenSymbol: primaryTransaction.sourceTokenSymbol,
    sourceTokenAmount: calcTokenAmount(
      primaryTransaction.sourceTokenAmount || 0,
      primaryTransaction.sourceTokenDecimals,
    ),
  };
}
