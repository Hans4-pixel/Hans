import log from 'loglevel';

import { isNullOrUndefined } from '@metamask/utils';
import { SWAPS_API_V2_BASE_URL } from '../../../shared/constants/swaps';
import {
  BUYABLE_CHAINS_MAP,
  CHAIN_IDS,
  WyreChainSettings,
  CurrencySymbol,
  ChainId,
} from '../../../shared/constants/network';
import getFetchWithTimeout from '../../../shared/modules/fetch-with-timeout';
import {
  TRANSAK_API_KEY,
  MOONPAY_API_KEY,
  COINBASEPAY_API_KEY,
} from '../constants/on-ramp';
import { formatMoonpaySymbol } from '../../../ui/helpers/utils/moonpay';

const fetchWithTimeout = getFetchWithTimeout();

/**
 * Create a Wyre purchase URL.
 *
 * @param walletAddress - Ethereum destination address
 * @param chainId - Current chain ID
 * @param symbol - Token symbol to buy
 * @returns String
 */
const createWyrePurchaseUrl = async (
  walletAddress: string,
  chainId: keyof typeof BUYABLE_CHAINS_MAP,
  symbol?: CurrencySymbol,
): Promise<any> => {
  const { wyre = {} as WyreChainSettings } = BUYABLE_CHAINS_MAP[chainId];
  const { srn, currencyCode } = wyre;

  const networkId = parseInt(chainId, 16);
  const fiatOnRampUrlApi = `${SWAPS_API_V2_BASE_URL}/networks/${networkId}/fiatOnRampUrl?serviceName=wyre&destinationAddress=${walletAddress}&currency=${
    symbol || currencyCode
  }`;
  const wyrePurchaseUrlFallback = `https://pay.sendwyre.com/purchase?dest=${srn}:${walletAddress}&destCurrency=${
    symbol || currencyCode
  }&accountId=AC-7AG3W4XH4N2&paymentMethod=debit-card`;
  try {
    const response = await fetchWithTimeout(fiatOnRampUrlApi, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const parsedResponse = await response.json();
    if (response.ok && parsedResponse.url) {
      return parsedResponse.url;
    }
    log.warn('Failed to create a Wyre purchase URL', parsedResponse);
  } catch (err) {
    log.warn('Failed to create a Wyre purchase URL', err);
  }
  return wyrePurchaseUrlFallback; // In case the API call would fail, we return a fallback URL for Wyre's Checkout.
};

/**
 * Create a Transak Checkout URL.
 * API docs here: https://www.notion.so/Query-Parameters-9ec523df3b874ec58cef4fa3a906f238
 *
 * @param walletAddress - Ethereum destination address
 * @param chainId - Current chain ID
 * @param symbol - Token symbol to buy
 * @returns String
 */
const createTransakUrl = (
  walletAddress: string,
  chainId: keyof typeof BUYABLE_CHAINS_MAP,
  symbol?: CurrencySymbol,
): string => {
  const { nativeCurrency, network } = BUYABLE_CHAINS_MAP[chainId];

  const queryParams = new URLSearchParams({
    apiKey: TRANSAK_API_KEY,
    hostURL: 'https://metamask.io',
    defaultCryptoCurrency: symbol || nativeCurrency,
    networks: network,
    walletAddress,
  });

  return `https://global.transak.com/?${queryParams}`;
};

/**
 * Create a MoonPay Checkout URL.
 *
 * @param walletAddress - Destination address
 * @param chainId - Current chain ID
 * @param symbol - Token symbol to buy
 * @returns String
 */
const createMoonPayUrl = async (
  walletAddress: string,
  chainId: keyof typeof BUYABLE_CHAINS_MAP,
  symbol?: CurrencySymbol,
): Promise<string> => {
  const { moonPay: { defaultCurrencyCode, showOnlyCurrencies } = {} as any } =
    BUYABLE_CHAINS_MAP[chainId];
  const moonPayQueryParams = new URLSearchParams({
    apiKey: MOONPAY_API_KEY,
    walletAddress,
    defaultCurrencyCode: symbol
      ? formatMoonpaySymbol(symbol, chainId)
      : defaultCurrencyCode,
    showOnlyCurrencies,
  });
  const queryParams = new URLSearchParams({
    url: `https://buy.moonpay.com?${moonPayQueryParams}`,
    context: 'extension',
  });
  const moonPaySignUrl = `${SWAPS_API_V2_BASE_URL}/moonpaySign/?${queryParams}`;
  try {
    const response = await fetchWithTimeout(moonPaySignUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const parsedResponse = await response.json();
    if (response.ok && parsedResponse.url) {
      return parsedResponse.url;
    }
    log.warn('Failed to create a MoonPay purchase URL', parsedResponse);
  } catch (err) {
    log.warn('Failed to create a MoonPay purchase URL', err);
  }
  return '';
};

/**
 * Create a Coinbase Pay Checkout URL.
 *
 * @param walletAddress - Ethereum destination address
 * @param chainId - Current chain ID
 * @param symbol - Token symbol to buy
 * @returns String
 */
const createCoinbasePayUrl = (
  walletAddress: string,
  chainId: keyof typeof BUYABLE_CHAINS_MAP,
  symbol?: CurrencySymbol,
): string => {
  // since coinbasePayCurrencies is going to be extended to include all tokens supported
  // we now default to nativeCurrency instead of the 2 previous tokens + eth that we had before
  const { nativeCurrency } = BUYABLE_CHAINS_MAP[chainId];
  const queryParams = new URLSearchParams({
    appId: COINBASEPAY_API_KEY,
    attribution: 'extension',
    destinationWallets: JSON.stringify([
      {
        address: walletAddress,
        assets: symbol ? [symbol] : [nativeCurrency],
      },
    ]),
  });
  return `https://pay.coinbase.com/buy?${queryParams}`;
};

const SERVICES_THAT_REQUIRE_ADDRESS_AND_CHAIN_ID = [
  'wyre',
  'coinbase',
  'moonpay',
  'transak',
];

/**
 * Gives the caller a url at which the user can acquire eth, depending on the network they are in
 *
 * @param opts - Options required to determine the correct url
 * @param opts.chainId - The chainId for which to return a url
 * @param opts.address - The address the bought ETH should be sent to.  Only relevant if chainId === '0x1'.
 * @param opts.service
 * @param opts.symbol - The symbol of the token to buy. Only relevant if buying a token.
 * @returns The url at which the user can access ETH, while in the given chain. If the passed
 * chainId does not match any of the specified cases, or if no chainId is given, returns undefined.
 */
export default async function getBuyUrl({
  chainId,
  address,
  service,
  symbol,
}: {
  chainId?: keyof typeof BUYABLE_CHAINS_MAP;
  address?: string;
  service?: string;
  symbol?: CurrencySymbol;
}): Promise<string> {
  // default service by network if not specified
  if (!service && chainId) {
    // eslint-disable-next-line no-param-reassign
    service = getDefaultServiceForChain(chainId);
  } else {
    throw new Error(
      'chainId is required for getBuyUrl if service is not supplied',
    );
  }

  if (
    SERVICES_THAT_REQUIRE_ADDRESS_AND_CHAIN_ID.includes(service) &&
    (isNullOrUndefined(chainId) || isNullOrUndefined(address))
  ) {
    throw new Error(
      `The address and chainId props are required for getBuyUrl for ${service}`,
    );
  }

  switch (service) {
    case 'wyre':
      return await createWyrePurchaseUrl(address as string, chainId, symbol);
    case 'transak':
      return createTransakUrl(address as string, chainId, symbol);
    case 'moonpay':
      return createMoonPayUrl(address as string, chainId, symbol);
    case 'coinbase':
      return createCoinbasePayUrl(address as string, chainId, symbol);
    case 'metamask-faucet':
      return 'https://faucet.metamask.io/';
    case 'goerli-faucet':
      return 'https://goerli-faucet.slock.it/';
    case 'sepolia-faucet':
      return 'https://faucet.sepolia.dev/';
    default:
      throw new Error(
        `Unknown cryptocurrency exchange or faucet: "${service}"`,
      );
  }
}

function getDefaultServiceForChain(chainId: ChainId): string {
  switch (chainId) {
    case CHAIN_IDS.MAINNET:
      return 'wyre';
    case CHAIN_IDS.GOERLI:
      return 'goerli-faucet';
    case CHAIN_IDS.SEPOLIA:
      return 'sepolia-faucet';
    default:
      throw new Error(
        `No default cryptocurrency exchange or faucet for chainId: "${chainId}"`,
      );
  }
}
