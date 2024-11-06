import React from 'react';
import { useSelector } from 'react-redux';
import {
  getMultichainIsTestnet,
  getMultichainProviderConfig,
  getMultichainSelectedAccountCachedBalance,
} from '../../../selectors/multichain';
///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
import { getIsBitcoinBuyable } from '../../../ducks/ramps';
///: END:ONLY_INCLUDE_IF
import { CoinOverview } from './coin-overview';
import { getSelectedInternalAccount } from '../../../selectors';
import { useMultichainSelector } from '../../../hooks/useMultichainSelector';

type BtcOverviewProps = {
  className?: string;
};

const BtcOverview = ({ className }: BtcOverviewProps) => {
  const selectedAccount = useSelector(getSelectedInternalAccount);
  const isBtcTestnetAccount = useMultichainSelector(
    getMultichainIsTestnet,
    selectedAccount,
  );
  console.log('isBtcTestnetAccount', isBtcTestnetAccount);
  console.log('selectedAccount', selectedAccount);
  const { chainId } = useSelector(getMultichainProviderConfig);
  const balance = useSelector(getMultichainSelectedAccountCachedBalance);
  ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
  const isBtcBuyable = useSelector(getIsBitcoinBuyable);
  ///: END:ONLY_INCLUDE_IF

  return (
    <CoinOverview
      balance={balance}
      // We turn this off to avoid having that asterisk + the "Balance maybe be outdated" message for now
      balanceIsCached={false}
      className={className}
      chainId={chainId}
      isSigningEnabled={true}
      isSwapsChain={false}
      ///: BEGIN:ONLY_INCLUDE_IF(build-main,build-beta,build-flask)
      isBridgeChain={false}
      isBuyableChain={isBtcBuyable && !isBtcTestnetAccount}
      ///: END:ONLY_INCLUDE_IF
    />
  );
};

export default BtcOverview;
