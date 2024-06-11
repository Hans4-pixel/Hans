import { isEvmAccountType } from '@metamask/keyring-api';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isEqual } from 'lodash';
import { ProviderConfig } from '@metamask/network-controller';
import { parseCaipChainId } from '@metamask/utils';
import { getProviderConfig } from '../../ducks/metamask/metamask';
import {
  MultiChainNetwork,
  NON_EVM_PROVIDER_CONFIGS,
} from '../../../shared/constants/non-evm-network';
import { getAllNetworks, getSelectedInternalAccount } from '..';

export type MultichainState = {
  metamask: {
    // non-EVM rates controller
    rates: Record<
      string,
      {
        conversionDate: number;
        conversionRate: number;
        usdConversionRate: number;
      }
    >;
    cryptocurrencies: string[];
    // balances controller
    balances: {
      [account: string]: {
        [asset: string]: {
          amount: string;
          unit: string;
        };
      };
    };
  };
};

export function isEvmSelectedAccount(state: MultichainState) {
  const selectedAccount = getSelectedInternalAccount(state);

  return isEvmAccountType(selectedAccount?.type);
}

export const useMultichainNetwork = (): {
  caip2: string;
  chainId: string;
  network?: ProviderConfig | MultiChainNetwork;
  isEvmNetwork: boolean;
} => {
  const selectedAccount = useSelector(getSelectedInternalAccount, isEqual);
  const isEvm = useSelector(isEvmSelectedAccount);
  // To be changed when non-evm networks are added to the store
  const nonEvmNetworks = Object.values(NON_EVM_PROVIDER_CONFIGS);

  // evm only selectors
  const evmNetworks: ProviderConfig[] = useSelector(getAllNetworks);
  const evmProvider: ProviderConfig = useSelector(getProviderConfig, isEqual);

  const memoizedResult = useMemo(() => {
    // there are no selected account during onboarding. we default to the current evm provider.
    if (isEvm || !selectedAccount) {
      return {
        caip2: `eip155:${evmProvider.chainId}`,
        chainId: evmProvider.chainId,
        network: evmNetworks.find(
          (network) => network.chainId === evmProvider.chainId,
        ),
        isEvmNetwork: true,
      };
    }

    // hardcoded for testing
    const nonEvmNetwork = nonEvmNetworks.find((provider) => {
      const accountTypeNameSpace = selectedAccount.type.split(':')[0];

      return (
        parseCaipChainId(provider.caip2).namespace === accountTypeNameSpace
      );
    });

    return {
      caip2: nonEvmNetwork?.caip2 as string,
      chainId: nonEvmNetwork?.chainId as string,
      network: nonEvmNetwork,
      isEvmNetwork: false,
    };
  }, [isEvm, evmProvider, evmNetworks, nonEvmNetworks, selectedAccount]);

  return memoizedResult;
};
