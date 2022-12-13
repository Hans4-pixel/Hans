import { isEqual } from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCollectibles, getTokens } from '../ducks/metamask/metamask';
import { getAssetDetails } from '../helpers/utils/token-util';
import { hideLoadingIndication, showLoadingIndication } from '../store/actions';
import { usePrevious } from './usePrevious';
import { useTokenTracker } from './useTokenTracker';

export function useAssetDetails(tokenAddress, userAddress, transactionData) {
  const dispatch = useDispatch();
  // state selectors
  const collectibles = useSelector(getCollectibles);
  const tokens = useSelector(getTokens, isEqual);
  const currentToken = tokens.find(
    (token) => token?.address?.toLowerCase() === tokenAddress.toLowerCase(),
  );

  // in-hook state
  const [currentAsset, setCurrentAsset] = useState(null);
  const { tokensWithBalances } = useTokenTracker([currentToken]);

  // previous state checkers
  const prevTokenAddress = usePrevious(tokenAddress);
  const prevUserAddress = usePrevious(userAddress);
  const prevTransactionData = usePrevious(transactionData);
  const prevTokenBalance = usePrevious(tokensWithBalances);

  useEffect(() => {
    async function getAndSetAssetDetails() {
      dispatch(showLoadingIndication());
      const assetDetails = await getAssetDetails(
        tokenAddress,
        userAddress,
        transactionData,
        collectibles,
      );
      setCurrentAsset(assetDetails);
      dispatch(hideLoadingIndication());
    }
    if (
      tokenAddress !== prevTokenAddress ||
      userAddress !== prevUserAddress ||
      transactionData !== prevTransactionData ||
      prevTokenBalance !== tokensWithBalances
    ) {
      getAndSetAssetDetails();
    }
  }, [
    dispatch,
    prevTokenAddress,
    prevTransactionData,
    prevUserAddress,
    tokenAddress,
    userAddress,
    transactionData,
    collectibles,
    tokensWithBalances,
    prevTokenBalance,
  ]);

  if (currentAsset) {
    const {
      standard,
      symbol,
      image,
      name,
      balance,
      tokenId,
      toAddress,
      tokenAmount,
      decimals,
    } = currentAsset;

    return {
      toAddress,
      tokenId,
      decimals,
      tokenAmount,
      assetAddress: tokenAddress,
      assetStandard: standard,
      tokenSymbol: symbol ?? '',
      tokenImage: image,
      userBalance: balance,
      assetName: name,
    };
  }

  return {};
}
