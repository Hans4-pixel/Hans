import { Hex } from '@metamask/utils';
import { BigNumber } from 'bignumber.js';
import { getAddress } from 'ethers/lib/utils';
import { ContractMarketData } from '@metamask/assets-controllers';
import { decGWEIToHexWEI } from '../../../shared/modules/conversion.utils';
import { Numeric } from '../../../shared/modules/Numeric';
import { TxData } from '../../pages/bridge/types';
import { getTransaction1559GasFeeEstimates } from '../../pages/swaps/swaps.util';
import { fetchTokenExchangeRates as fetchTokenExchangeRatesUtil } from '../../helpers/utils/util';

// We don't need to use gas multipliers here because the gasLimit from Bridge API already included it
export const getHexMaxGasLimit = (gasLimit: number) => {
  return new Numeric(
    new BigNumber(gasLimit).toString(),
    10,
  ).toPrefixedHexString() as Hex;
};
export const getTxGasEstimates = async ({
  networkAndAccountSupports1559,
  networkGasFeeEstimates,
  txParams,
  hexChainId,
}: {
  networkAndAccountSupports1559: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  networkGasFeeEstimates: any;
  txParams: TxData;
  hexChainId: Hex;
}) => {
  if (networkAndAccountSupports1559) {
    const { estimatedBaseFeeGwei = '0' } = networkGasFeeEstimates;
    const hexEstimatedBaseFee = decGWEIToHexWEI(estimatedBaseFeeGwei) as Hex;
    const txGasFeeEstimates = await getTransaction1559GasFeeEstimates(
      {
        ...txParams,
        chainId: hexChainId,
        gasLimit: txParams.gasLimit?.toString(),
      },
      hexEstimatedBaseFee,
      hexChainId,
    );
    return txGasFeeEstimates;
  }

  return {
    baseAndPriorityFeePerGas: undefined,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  };
};

const fetchTokenExchangeRates = async (
  chainId: string,
  currency: string,
  ...tokenAddresses: string[]
) => {
  const exchangeRates = await fetchTokenExchangeRatesUtil(
    currency,
    tokenAddresses,
    chainId,
  );
  return Object.keys(exchangeRates).reduce(
    (acc: Record<string, number | undefined>, address) => {
      acc[address.toLowerCase()] = exchangeRates[address];
      return acc;
    },
    {},
  );
};

export const getTokenExchangeRate = async (request: {
  chainId: Hex;
  tokenAddress: string;
  currency: string;
}) => {
  const { chainId, tokenAddress, currency } = request;
  const exchangeRates = await fetchTokenExchangeRates(
    chainId,
    currency,
    tokenAddress,
  );
  const exchangeRate =
    exchangeRates?.[tokenAddress.toLowerCase()] ??
    exchangeRates?.[getAddress(tokenAddress)];
  return exchangeRate;
};

export const exchangeRateFromMarketData = (
  chainId: string,
  tokenAddress: string,
  marketData?: Record<string, ContractMarketData>,
) =>
  (
    marketData?.[chainId]?.[tokenAddress.toLowerCase() as Hex] ??
    marketData?.[chainId]?.[getAddress(tokenAddress) as Hex]
  )?.price;

export const tokenAmountToFiat = (
  amount: string | BigNumber,
  exchangeRate: number,
) =>
  new Numeric(amount, 10)
    .applyConversionRate(new BigNumber(exchangeRate.toString(), 10))
    .toNumber();

export const tokenPriceInNativeAsset = (
  tokenExchangeRate?: number | null,
  nativeToFiatRate?: number | null,
) => {
  return tokenExchangeRate && nativeToFiatRate
    ? tokenExchangeRate / nativeToFiatRate
    : null;
};

export const exchangeRatesFromNativeAndFiatRates = (
  tokenToNativeAssetRate?: number | null,
  nativeToFiatRate?: number | null,
  nativeToUsdRate?: number | null,
) => {
  return {
    fiat:
      tokenToNativeAssetRate && nativeToFiatRate
        ? tokenToNativeAssetRate * nativeToFiatRate
        : null,
    usd:
      tokenToNativeAssetRate && nativeToUsdRate
        ? tokenToNativeAssetRate * nativeToUsdRate
        : null,
  };
};
