import { useMemo } from 'react';

import { MESSAGE_TYPE } from '../../../../shared/constants/app';
import { parseTypedDataMessage } from '../../../../shared/modules/transaction.utils';
import { SignatureRequestType } from '../types/confirm';
import { isPermitSignatureRequest } from '../utils';
import { useConfirmContext } from '../context/confirm';
import { useSelector } from 'react-redux';
import { selectUseTransactionSimulations } from '../selectors/preferences';

const NON_PERMIT_SUPPORTED_TYPES_SIGNS = [
  {
    domainName: 'Seaport',
    primaryTypeList: ['BulkOrder'],
    versionList: ['1.4', '1.5', '1.6'],
  },
  {
    domainName: 'Seaport',
    primaryTypeList: ['OrderComponents'],
  },
];

const isNonPermitSupportedByDecodingAPI = (
  signatureRequest: SignatureRequestType,
) => {
  const data = (signatureRequest as SignatureRequestType).msgParams
    ?.data as string;
  if (!data) {
    return false;
  }
  const {
    domain: { name, version },
    primaryType,
  } = parseTypedDataMessage(data);
  return NON_PERMIT_SUPPORTED_TYPES_SIGNS.some(
    ({ domainName, primaryTypeList, versionList }) =>
      name === domainName &&
      primaryTypeList.includes(primaryType) &&
      (!versionList || versionList.includes(version)),
  );
};

export function useTypesSignSimulationEnabledInfo() {
  const { currentConfirmation } = useConfirmContext<SignatureRequestType>();
  const useTransactionSimulations = useSelector(
    selectUseTransactionSimulations,
  );

  const isTypedSignV4 =
    currentConfirmation?.msgParams?.signatureMethod ===
    MESSAGE_TYPE.ETH_SIGN_TYPED_DATA_V4;
  const isPermit = isPermitSignatureRequest(currentConfirmation);
  const nonPermitSupportedByDecodingAPI =
    isNonPermitSupportedByDecodingAPI(currentConfirmation);

  return useMemo(() => {
    if (!currentConfirmation) {
      return undefined;
    }
    return (
      useTransactionSimulations &&
      isTypedSignV4 &&
      (isPermit || nonPermitSupportedByDecodingAPI)
    );
  }, [isTypedSignV4, isPermit, nonPermitSupportedByDecodingAPI]);
}
