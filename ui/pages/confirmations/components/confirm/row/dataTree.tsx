import React, { memo } from 'react';

import { PERMIT_PRIMARY_TYPE } from '../../../../../../shared/constants/transaction';

import { isValidHexAddress } from '../../../../../../shared/modules/hexstring-utils';
import { sanitizeString } from '../../../../../helpers/utils/util';

import { Box } from '../../../../../components/component-library';
import { BlockSize } from '../../../../../helpers/constants/design-system';
import {
  ConfirmInfoRow,
  ConfirmInfoRowAddress,
  ConfirmInfoRowDate,
  ConfirmInfoRowText,
  ConfirmInfoRowTextToken,
} from '../../../../../components/app/confirm/info/row';

type ValueType = string | Record<string, TreeData> | TreeData[];

export type TreeData = {
  value: ValueType;
  type: string;
};

export const DataTree = ({
  data,
  isPermit = false,
  primaryType,
  tokenDecimals = 0,
}: {
  data: Record<string, TreeData> | TreeData[];
  isPermit?: boolean;
  primaryType?: PERMIT_PRIMARY_TYPE;
  tokenDecimals?: number;
}) => (
  <Box width={BlockSize.Full}>
    {Object.entries(data).map(([label, { value, type }], i) => (
      <ConfirmInfoRow
        label={`${sanitizeString(
          label.charAt(0).toUpperCase() + label.slice(1),
        )}:`}
        style={{ paddingRight: 0 }}
        key={`tree-data-${label}-index-${i}`}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          <DataField
            label={label}
            isPermit={isPermit}
            primaryType={primaryType}
            value={value}
            type={type}
            tokenDecimals={tokenDecimals}
          />
        }
      </ConfirmInfoRow>
    ))}
  </Box>
);

const DataField = memo(
  ({
    label,
    isPermit,
    primaryType,
    type,
    value,
    tokenDecimals,
  }: {
    label: string;
    isPermit: boolean;
    primaryType: PERMIT_PRIMARY_TYPE | undefined;
    type: string;
    value: ValueType;
    tokenDecimals: number;
  }) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <DataTree
          data={value}
          isPermit={isPermit}
          primaryType={primaryType}
          tokenDecimals={tokenDecimals}
        />
      );
    }

    const isPermitSingle = primaryType === PERMIT_PRIMARY_TYPE.PERMIT_SINGLE;
    const isDate =
      value &&
      ((isPermit && label === 'deadline') ||
        (isPermitSingle && label === 'expiration') ||
        (isPermitSingle && label === 'sigDeadline'));

    if (isDate) {
      return <ConfirmInfoRowDate date={parseInt(value, 10)} />;
    }

    const isTokenUnits =
      (isPermit && label === 'value') || (isPermitSingle && label === 'amount');
    if (isTokenUnits) {
      return <ConfirmInfoRowTextToken value={value} decimals={tokenDecimals} />;
    }

    if (
      type === 'address' &&
      isValidHexAddress(value, {
        mixedCaseUseChecksum: true,
      })
    ) {
      return <ConfirmInfoRowAddress address={value} />;
    }

    return <ConfirmInfoRowText text={sanitizeString(value)} />;
  },
);
