import { useSelector } from 'react-redux';

import {
  accountsWithSendEtherInfoSelector,
  currentConfirmationSelector,
} from '../../selectors';
import { getAccountByAddress } from '../../helpers/utils/util';

function useConfirmationRecipientInfo() {
  const currentConfirmation = useSelector(currentConfirmationSelector);
  const allAccounts = useSelector(accountsWithSendEtherInfoSelector);

  let recipientAddress = '';
  let recipientName = '';

  if (currentConfirmation) {
    // Code below takes care to fix recipient name to be displayed for signature requests
    const { msgParams } = currentConfirmation;
    if (msgParams) {
      recipientAddress = msgParams.from;
      const fromAccount = getAccountByAddress(allAccounts, recipientAddress);
      recipientName = fromAccount?.name;
    }
    // TODO: as we add support for more transaction code to find recipient address for different
    // transaction types will come here
  }

  return {
    recipientAddress,
    recipientName,
  };
}

export default useConfirmationRecipientInfo;
