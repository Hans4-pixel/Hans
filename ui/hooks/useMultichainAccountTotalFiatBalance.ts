import { useSelector } from 'react-redux';
import { InternalAccount, isEvmAccountType } from '@metamask/keyring-api';
import {
  getMultichainCurrencyImage,
  getMultichainBalances,
  getMultichainCoinRates,
  getMultichainNetwork,
} from '../selectors/multichain';
import { formatCurrency } from '../helpers/utils/confirm-tx.util';
import { MULTICHAIN_NATIVE_CURRENCY_TO_CAIP19 } from '../../shared/constants/multichain/networks';
import { getTokenFiatAmount } from '../helpers/utils/token-util';
import { useMultichainSelector } from './useMultichainSelector';

export const EMPTY_VALUES = {
  formattedFiat: '0',
  totalFiatBalance: '0',
  tokensWithBalances: [],
  loading: false,
  orderedTokenList: [],
  error: null,
};

export const useMultichainAccountTotalFiatBalance = (
  account: InternalAccount,
): {
  formattedFiat: string;
  totalFiatBalance: string;
  tokensWithBalances: {
    address: string;
    symbol: string;
    decimals: string;
    isERC721: boolean;
    image: string;
  }[];
  loading: boolean;
  orderedTokenList: { iconUrl: string; symbol: string; fiatBalance: string }[];
  error: string | null;
} => {
  if (isEvmAccountType(account.type)) {
    return EMPTY_VALUES;
  }

  // The fiat denomination to display
  // TODO: fix me when we have a know how to deal with non usd currencies.
  const currentCurrency = 'usd';
  const { network } = useMultichainSelector(getMultichainNetwork, account);
  const ticker = isEvmAccountType(account.type) ? 'ETH' : 'BTC';

  // get rate from rate controller
  const multichainCoinRates = useSelector(getMultichainCoinRates);
  // rates uses the lower case ticker
  const { conversionRate } = multichainCoinRates[network.ticker.toLowerCase()];
  // chainId will be defined here if it is a multichain account
  const nativeCurrencyImage: string = useMultichainSelector(
    getMultichainCurrencyImage,
    account,
  );

  const balances = useSelector(getMultichainBalances);
  // TODO: find dynamic way to ensure balance is the highest denomination.
  const asset =
    MULTICHAIN_NATIVE_CURRENCY_TO_CAIP19[
      ticker as keyof typeof MULTICHAIN_NATIVE_CURRENCY_TO_CAIP19
    ];

  if (!balances[account.id]?.[asset]) {
    // FIXME: We might try to get the balance for a created account, but the
    // BalancesController might not have updated it yet!
    return EMPTY_VALUES;
  }
  const { amount } =
    balances[account.id][
      MULTICHAIN_NATIVE_CURRENCY_TO_CAIP19[
        ticker as keyof typeof MULTICHAIN_NATIVE_CURRENCY_TO_CAIP19
      ]
    ];

  const totalFiatBalance =
    getTokenFiatAmount(
      1, // coin to native conversion rate is 1:1
      Number(conversionRate), // native to fiat conversion rate
      currentCurrency,
      amount,
      ticker,
      false,
      false,
    ) ?? '0'; // if the conversion fails, return 0

  // Create an object with native token info. NOTE: Native token info is fetched from a separate controller
  const nativeTokenValues = {
    iconUrl: nativeCurrencyImage,
    symbol: ticker,
    fiatBalance: totalFiatBalance,
  };

  // Fiat balance formatted in user's desired currency (ex: "$8.90")
  const formattedFiat = formatCurrency(totalFiatBalance, currentCurrency);

  return {
    formattedFiat,
    totalFiatBalance,
    tokensWithBalances: [], // TODO: support tokens
    loading: false, // TODO: support tokens
    orderedTokenList: [nativeTokenValues], // TODO: support tokens
    error: null,
  };
};
