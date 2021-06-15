import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import AddTokenButton from '../add-token-button';
import TokenList from '../token-list';
import { ADD_TOKEN_ROUTE } from '../../../helpers/constants/routes';
import AssetListItem from '../asset-list-item';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { useMetricEvent } from '../../../hooks/useMetricEvent';
import { useUserPreferencedCurrency } from '../../../hooks/useUserPreferencedCurrency';
import {
  getCurrentAccountWithSendEtherInfo,
  getShouldShowFiat,
  getNativeCurrencyImage,
} from '../../../selectors';
import {
  getConversionRate,
  getNativeCurrency,
} from '../../../ducks/metamask/metamask';
import { useCurrencyDisplay } from '../../../hooks/useCurrencyDisplay';

const AssetList = ({ onClickAsset }) => {
  const history = useHistory();
  const selectedAccountBalance = useSelector(
    (state) => getCurrentAccountWithSendEtherInfo(state).balance,
  );
  const conversionRate = useSelector(getConversionRate);
  const nativeCurrency = useSelector(getNativeCurrency);
  const showFiat = useSelector(getShouldShowFiat);
  const selectTokenEvent = useMetricEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Token Menu',
      name: 'Clicked Token',
    },
  });
  const addTokenEvent = useMetricEvent({
    eventOpts: {
      category: 'Navigation',
      action: 'Token Menu',
      name: 'Clicked "Add Token"',
    },
  });

  const {
    currency: primaryCurrency,
    numberOfDecimals: primaryNumberOfDecimals,
  } = useUserPreferencedCurrency(PRIMARY, { ethNumberOfDecimals: 4 });
  const {
    currency: secondaryCurrency,
    numberOfDecimals: secondaryNumberOfDecimals,
  } = useUserPreferencedCurrency(SECONDARY, { ethNumberOfDecimals: 4 });

  const [, primaryCurrencyProperties] = useCurrencyDisplay(
    selectedAccountBalance,
    {
      numberOfDecimals: primaryNumberOfDecimals,
      currency: primaryCurrency,
      type: PRIMARY,
    },
  );

  const [, secondaryCurrencyProperties] = useCurrencyDisplay(
    selectedAccountBalance,
    {
      numberOfDecimals: secondaryNumberOfDecimals,
      currency: secondaryCurrency,
      type: SECONDARY,
    },
  );

  const primaryTokenImage = useSelector(getNativeCurrencyImage);
  const showSecondaryCurrency =
    showFiat &&
    Boolean(primaryCurrencyProperties?.value) &&
    Boolean(conversionRate);

  return (
    <>
      <AssetListItem
        onClick={() => onClickAsset(nativeCurrency)}
        data-testid="wallet-balance"
        primary={
          primaryCurrencyProperties?.value
            ? primaryCurrencyProperties?.value
            : secondaryCurrencyProperties?.value
        }
        secondary={
          showSecondaryCurrency ? secondaryCurrencyProperties?.value : undefined
        }
        secondarySymbol={
          showSecondaryCurrency
            ? secondaryCurrencyProperties?.suffix
            : undefined
        }
        primarySymbol={
          primaryCurrencyProperties?.value
            ? primaryCurrencyProperties?.suffix
            : secondaryCurrencyProperties?.suffix
        }
        tokenImage={primaryTokenImage}
        identiconBorder
      />
      <TokenList
        onTokenClick={(tokenAddress) => {
          onClickAsset(tokenAddress);
          selectTokenEvent();
        }}
      />
      <AddTokenButton
        onClick={() => {
          history.push(ADD_TOKEN_ROUTE);
          addTokenEvent();
        }}
      />
    </>
  );
};

AssetList.propTypes = {
  onClickAsset: PropTypes.func.isRequired,
};

export default AssetList;
