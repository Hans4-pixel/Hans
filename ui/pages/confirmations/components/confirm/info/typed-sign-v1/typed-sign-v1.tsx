import React from 'react';
import { useSelector } from 'react-redux';

import {
  ConfirmInfoRow,
  ConfirmInfoRowUrl,
} from '../../../../../../components/app/confirm/info/row';
import { useI18nContext } from '../../../../../../hooks/useI18nContext';
import { currentConfirmationSelector } from '../../../../../../selectors';
import { Box } from '../../../../../../components/component-library';
import {
  BackgroundColor,
  BorderRadius,
} from '../../../../../../helpers/constants/design-system';
import { ConfirmInfoRowTypedSignDataV1 } from '../../row/typed-sign-data-v1/typedSignDataV1';
import { TypedSignDataV1Type } from '../../../../types/confirm';

const TypedSignV1Info: React.FC = () => {
  const t = useI18nContext();
  const currentConfirmation = useSelector(currentConfirmationSelector);

  if (!currentConfirmation?.msgParams) {
    return null;
  }

  const data = (
    currentConfirmation.msgParams?.data as TypedSignDataV1Type
  ).reduce(
    (val, { name, value, type }) => ({ ...val, [name]: { type, value } }),
    {},
  );

  return (
    <>
      <Box
        backgroundColor={BackgroundColor.backgroundDefault}
        borderRadius={BorderRadius.MD}
        padding={2}
        marginBottom={4}
      >
        <ConfirmInfoRow label={t('requestFrom')} tooltip={t('requestFromInfo')}>
          <ConfirmInfoRowUrl url={currentConfirmation.msgParams.origin} />
        </ConfirmInfoRow>
      </Box>
      <Box
        backgroundColor={BackgroundColor.backgroundDefault}
        borderRadius={BorderRadius.MD}
        padding={2}
        marginBottom={4}
      >
        <ConfirmInfoRow label={t('message')}>
          <ConfirmInfoRowTypedSignDataV1 data={data} />
        </ConfirmInfoRow>
      </Box>
    </>
  );
};

export default TypedSignV1Info;
