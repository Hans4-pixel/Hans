import { useState } from 'react';
import { isEqual } from 'lodash';

import { GAS_ESTIMATE_TYPES } from '../../../shared/constants/gas';
import { hexWEIToDecGWEI } from '../../helpers/utils/conversions.util';
import { isLegacyTransaction } from '../../helpers/utils/transactions.util';

import { feeParamsAreCustom } from './utils';

function getGasPriceEstimate(gasFeeEstimates, gasEstimateType, estimateToUse) {
  if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
    return gasFeeEstimates?.[estimateToUse] ?? '0';
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
    return gasFeeEstimates?.gasPrice ?? '0';
  }
  return '0';
}

/**
 * @typedef {Object} GasPriceInputsReturnType
 * @property {DecGweiString} [gasPrice] - the gasPrice input value.
 * @property {(DecGweiString) => void} setGasPrice - state setter method to update the gasPrice.
 * @property {(boolean) => true} setGasPriceHasBeenManuallySet - state setter method to update gasPriceHasBeenManuallySet
 * field gasPriceHasBeenManuallySet is used in gasPrice calculations.
 */
export function useGasPriceInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  transaction,
}) {
  const [gasPriceHasBeenManuallySet, setGasPriceHasBeenManuallySet] = useState(
    transaction?.userFeeLevel === 'custom',
  );

  const [gasPrice, setGasPrice] = useState(() => {
    const { gasPrice: txGasPrice } = transaction?.txParams || {};
    return txGasPrice && feeParamsAreCustom(transaction)
      ? Number(hexWEIToDecGWEI(txGasPrice))
      : null;
  });

  const [initialGasPriceEstimates] = useState(gasFeeEstimates);
  const gasPriceEstimatesHaveNotChanged = isEqual(
    initialGasPriceEstimates,
    gasFeeEstimates,
  );

  const gasPriceToUse =
    gasPrice !== null &&
    (gasPriceHasBeenManuallySet ||
      gasPriceEstimatesHaveNotChanged ||
      isLegacyTransaction(transaction?.txParams))
      ? gasPrice
      : getGasPriceEstimate(gasFeeEstimates, gasEstimateType, estimateToUse);

  return {
    gasPrice: gasPriceToUse,
    setGasPrice,
    setGasPriceHasBeenManuallySet,
  };
}
