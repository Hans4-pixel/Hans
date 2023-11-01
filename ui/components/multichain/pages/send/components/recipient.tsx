import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  addHistoryEntry,
  getRecipient,
  getRecipientUserInput,
  updateRecipient,
  updateRecipientUserInput,
} from '../../../../../ducks/send';
import {
  getDomainError,
  getDomainResolution,
  getDomainWarning,
} from '../../../../../ducks/domains';
import {
  BannerAlert,
  BannerAlertSeverity,
  Box,
} from '../../../../component-library';
import { getAddressBookEntry } from '../../../../../selectors';
import Identicon from '../../../../ui/identicon';
import Confusable from '../../../../ui/confusable';
import { ellipsify } from '../../../../../pages/send/send.utils';
import { SendPageAddressBook, SendPageRow, SendPageYourAccount } from '.';

const renderExplicitAddress = (
  address: string,
  nickname: string,
  type: string,
  dispatch: any,
) => {
  return (
    <div
      key={address}
      className="send__select-recipient-wrapper__group-item"
      onClick={() => {
        dispatch(
          addHistoryEntry(
            `sendFlow - User clicked recipient from ${type}. address: ${address}, nickname ${nickname}`,
          ),
        );
        dispatch(updateRecipient({ address, nickname }));
        dispatch(updateRecipientUserInput(address));
      }}
    >
      <Identicon address={address} diameter={28} />
      <div className="send__select-recipient-wrapper__group-item__content">
        <div className="send__select-recipient-wrapper__group-item__title">
          {nickname ? <Confusable input={nickname} /> : ellipsify(address)}
        </div>
        {nickname && (
          <div className="send__select-recipient-wrapper__group-item__subtitle">
            {ellipsify(address)}
          </div>
        )}
      </div>
    </div>
  );
};

export const SendPageRecipient = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();

  const recipient = useSelector(getRecipient);
  const userInput = useSelector(getRecipientUserInput);

  const domainResolution = useSelector(getDomainResolution);
  const domainError = useSelector(getDomainError);
  const domainWarning = useSelector(getDomainWarning);

  let addressBookEntryName = '';
  const entry = useSelector((state) =>
    getAddressBookEntry(state, domainResolution),
  );
  if (domainResolution && entry?.name) {
    addressBookEntryName = entry.name;
  }

  const showErrorBanner =
    domainError || (recipient.error && recipient.error !== 'required');
  const showWarningBanner =
    !showErrorBanner && (domainWarning || recipient.warning);

  let contents;
  if (recipient.address) {
    contents = renderExplicitAddress(
      recipient.address,
      recipient.nickname,
      'validated user input',
      dispatch,
    );
  } else if (domainResolution && !recipient.error) {
    contents = renderExplicitAddress(
      domainResolution,
      addressBookEntryName ?? userInput,
      'ENS resolution',
      dispatch,
    );
  } else {
    contents = (
      <>
        {userInput ? null : <SendPageYourAccount />}
        <SendPageAddressBook />
      </>
    );
  }

  return (
    <SendPageRow>
      {showErrorBanner ? (
        <BannerAlert severity={BannerAlertSeverity.Danger} marginTop={6}>
          {t(domainError ?? recipient.error)}
        </BannerAlert>
      ) : null}
      {showWarningBanner ? (
        <BannerAlert severity={BannerAlertSeverity.Warning} marginTop={6}>
          {t(domainWarning ?? recipient.warning)}
        </BannerAlert>
      ) : null}
      <Box marginTop={6}>{contents}</Box>
    </SendPageRow>
  );
};
