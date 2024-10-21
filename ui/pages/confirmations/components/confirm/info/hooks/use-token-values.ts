import { TransactionMeta } from '@metamask/transaction-controller';
import { isHexString } from '@metamask/utils';
import { BigNumber } from 'bignumber.js';
import { isBoolean } from 'lodash';
import { useMemo, useState } from 'react';
import { Numeric } from '../../../../../../../shared/modules/Numeric';
import useTokenExchangeRate from '../../../../../../components/app/currency-input/hooks/useTokenExchangeRate';
import { useFiatFormatter } from '../../../../../../hooks/useFiatFormatter';
import { useAssetDetails } from '../../../../hooks/useAssetDetails';
import { useDecodedTransactionData } from './useDecodedTransactionData';

export const useTokenValues = (transactionMeta: TransactionMeta) => {
  const { decimals } = useAssetDetails(
    transactionMeta.txParams.to,
    transactionMeta.txParams.from,
    transactionMeta.txParams.data,
  );

  const decodedResponse = useDecodedTransactionData();
  const { value, pending } = decodedResponse;

  const decodedTransferValue = useMemo(() => {
    if (!value || !decimals) {
      return 0;
    }

    const paramIndex = value.data[0].params.findIndex(
      (param) =>
        param.value !== undefined &&
        !isHexString(param.value) &&
        param.value.length === undefined &&
        !isBoolean(param.value),
    );
    if (paramIndex === -1) {
      return 0;
    }

    return new BigNumber(value.data[0].params[paramIndex].value.toString())
      .dividedBy(new BigNumber(10).pow(Number(decimals)))
      .toNumber();
  }, [value, decimals]);

  const [exchangeRate, setExchangeRate] = useState<Numeric | undefined>();
  const fetchExchangeRate = async () => {
    const result = await useTokenExchangeRate(transactionMeta?.txParams?.to);

    setExchangeRate(result);
  };
  fetchExchangeRate();

  const fiatValue =
    exchangeRate &&
    decodedTransferValue &&
    exchangeRate.times(decodedTransferValue, 10).toNumber();
  const fiatFormatter = useFiatFormatter();
  const fiatDisplayValue =
    fiatValue && fiatFormatter(fiatValue, { shorten: true });

  const displayTransferValue = roundDisplayValue(decodedTransferValue);

  return {
    decodedTransferValue: toNonScientificString(decodedTransferValue),
    displayTransferValue,
    fiatDisplayValue,
    pending,
  };
};

export function roundDisplayValue(decodedTransferValue: number): string {
  switch (true) {
    case decodedTransferValue === 0:
      return '0';
    case decodedTransferValue < 0.000001:
      return '<0.000001';
    case decodedTransferValue < 0.001:
      return parseFloat(decodedTransferValue.toFixed(6)).toString();
    case decodedTransferValue < 0.01:
      return parseFloat(decodedTransferValue.toFixed(5)).toString();
    case decodedTransferValue < 0.1:
      return parseFloat(decodedTransferValue.toFixed(4)).toString();
    case decodedTransferValue < 10:
      return parseFloat(decodedTransferValue.toFixed(3)).toString();
    case decodedTransferValue < 100:
      return parseFloat(decodedTransferValue.toFixed(2)).toString();
    case decodedTransferValue < 1000:
      return parseFloat(decodedTransferValue.toFixed(1)).toString();
    case decodedTransferValue < 10000:
      return parseFloat(decodedTransferValue.toFixed(0)).toString();
    default:
      return parseFloat(decodedTransferValue.toFixed(0)).toString();
  }
}

export function toNonScientificString(num: number): string {
  if (num >= 10e-18) {
    return num.toFixed(18).replace(/\.?0+$/u, '');
  }

  // keep in scientific notation
  return num.toString();
}
