export function getAccountNameErrorMessage(
  accounts,
  context,
  newAccountName,
  defaultAccountName,
) {
  const isDuplicateAccountName = accounts.some(
    (item) => item.name === newAccountName,
  );

  const localizedWordForAccount = context
    .t('newAccountNumberName')
    .replace(' $1', '');

  const reservedRegEx = new RegExp(`^${localizedWordForAccount} \\d+$`, 'iu'); // Match strings starting with ${localizedWordForAccount} and then any numeral, case insensitive
  const isReservedAccountName = reservedRegEx.test(newAccountName);

  const isValidAccountName =
    newAccountName === defaultAccountName || // What is written in the text field is the same as the placeholder
    (!isDuplicateAccountName && !isReservedAccountName);

  let errorMessage;
  if (isValidAccountName) {
    errorMessage = '\u200d'; // This is Unicode for an invisible character, so the spacing stays constant
  } else if (isDuplicateAccountName) {
    errorMessage = context.t('accountNameDuplicate');
  } else if (isReservedAccountName) {
    errorMessage = context.t('accountNameReserved');
  }

  return { isValidAccountName, errorMessage };
}
