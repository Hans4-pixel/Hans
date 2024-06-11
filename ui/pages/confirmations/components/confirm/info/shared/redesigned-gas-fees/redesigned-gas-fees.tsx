import { TransactionMeta } from '@metamask/transaction-controller';
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { EtherDenomination } from '../../../../../../../../shared/constants/common';
import { EditGasModes } from '../../../../../../../../shared/constants/gas';
import {
  addHexes,
  getEthConversionFromWeiHex,
  getValueFromWeiHex,
  subtractHexes,
} from '../../../../../../../../shared/modules/conversion.utils';
import { getMinimumGasTotalInHexWei } from '../../../../../../../../shared/modules/gas.utils';
import {
  ConfirmInfoRow,
  ConfirmInfoRowVariant,
} from '../../../../../../../components/app/confirm/info/row';
import {
  Box,
  Button,
  ButtonSize,
  ButtonVariant,
  IconName,
  Text,
} from '../../../../../../../components/component-library';
import { getConversionRate } from '../../../../../../../ducks/metamask/metamask';
import {
  AlignItems,
  BlockSize,
  BorderColor,
  Display,
  FlexDirection,
  IconColor,
  JustifyContent,
  TextAlign,
  TextColor,
  TextVariant,
} from '../../../../../../../helpers/constants/design-system';
import { useFiatFormatter } from '../../../../../../../hooks/useFiatFormatter';
import { useI18nContext } from '../../../../../../../hooks/useI18nContext';
import { getCurrentCurrency } from '../../../../../../../selectors';
import AdvancedGasFeePopover from '../../../../advanced-gas-fee-popover';
import EditGasFeePopover from '../../../../edit-gas-fee-popover';
import EditGasPopover from '../../../../edit-gas-popover';
import GasTiming from '../../../../gas-timing';
import { useEIP1559TxFees } from '../../hooks/useEIP1559TxFees';
import { useSupportsEIP1559 } from '../../hooks/useSupportsEIP1559';
import { EditGasIconButton } from '../edit-gas-icon/edit-gas-icon-button';

// TODO(pnf): review localization once design and copy are finalized

function getGasEstimate(
  transactionMeta: TransactionMeta,
  supportsEIP1559: boolean,
  maxFeePerGas: string,
  maxPriorityFeePerGas: string,
): string {
  const { gas: gasLimit } = (transactionMeta as TransactionMeta).txParams;

  let gasEstimate;
  if (supportsEIP1559) {
    const baseFeePerGas = subtractHexes(maxFeePerGas, maxPriorityFeePerGas);

    gasEstimate = getMinimumGasTotalInHexWei({
      ...transactionMeta.txParams,
      gasLimit,
      baseFeePerGas,
    });
  } else {
    gasEstimate = getMinimumGasTotalInHexWei({
      ...transactionMeta.txParams,
      gasLimit,
    });
  }

  return gasEstimate;
}

const Type2TxGasModal = () => {
  return (
    <>
      <EditGasFeePopover />
      <AdvancedGasFeePopover />
    </>
  );
};

const Type0TxGasModal = ({
  closeCustomizeGasPopover,
  transactionMeta,
}: {
  closeCustomizeGasPopover: () => void;
  transactionMeta: TransactionMeta;
}) => {
  return (
    <EditGasPopover
      onClose={closeCustomizeGasPopover}
      mode={EditGasModes.modifyInPlace}
      transaction={transactionMeta}
    />
  );
};

const TotalFeesRow = ({
  currentCurrencyTotalFees,
  nativeCurrencyTotalFees,
}: {
  currentCurrencyTotalFees: string | null;
  nativeCurrencyTotalFees: string | null | undefined;
}) => {
  return (
    <ConfirmInfoRow label="Total" variant={ConfirmInfoRowVariant.Default}>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        alignItems={AlignItems.center}
        textAlign={TextAlign.Center}
        style={{ flexGrow: '1' }}
        marginLeft={8}
      >
        <Text color={TextColor.textAlternative}>
          {currentCurrencyTotalFees}
        </Text>
        <Text color={TextColor.textAlternative}>{nativeCurrencyTotalFees}</Text>
      </Box>
    </ConfirmInfoRow>
  );
};

const Layer1FeesRow = ({
  currentCurrencyL1Fees,
  nativeCurrencyL1Fees,
}: {
  currentCurrencyL1Fees: string | null;
  nativeCurrencyL1Fees: string | null | undefined;
}) => {
  return (
    <ConfirmInfoRow label="L1 Fees" variant={ConfirmInfoRowVariant.Default}>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        alignItems={AlignItems.center}
        textAlign={TextAlign.Center}
        style={{ flexGrow: '1' }}
        marginLeft={8}
      >
        <Text color={TextColor.textAlternative}>{currentCurrencyL1Fees}</Text>
        <Text color={TextColor.textAlternative}>{nativeCurrencyL1Fees}</Text>
      </Box>
    </ConfirmInfoRow>
  );
};

const Layer2FeesRow = ({
  currentCurrencyFees,
  nativeCurrencyFees,
}: {
  currentCurrencyFees: string;
  nativeCurrencyFees: string | undefined;
}) => {
  return (
    <ConfirmInfoRow label="L2 Fees" variant={ConfirmInfoRowVariant.Default}>
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        alignItems={AlignItems.center}
        textAlign={TextAlign.Center}
        style={{ flexGrow: '1' }}
        marginLeft={8}
      >
        <Text color={TextColor.textAlternative}>{currentCurrencyFees}</Text>
        <Text color={TextColor.textAlternative}>{nativeCurrencyFees}</Text>
      </Box>
    </ConfirmInfoRow>
  );
};

const Layer2GasFeesExpandBtn = ({
  expandFeeDetails,
  setExpandFeeDetails,
}: {
  expandFeeDetails: boolean;
  setExpandFeeDetails: (currentExpandFeeDetails: boolean) => void;
}) => {
  const t = useI18nContext();

  return (
    <Box
      padding={4}
      display={Display.Flex}
      alignItems={AlignItems.center}
      justifyContent={JustifyContent.center}
    >
      <Button
        style={{ textDecoration: 'none' }}
        size={ButtonSize.Sm}
        variant={ButtonVariant.Link}
        endIconName={expandFeeDetails ? IconName.ArrowUp : IconName.ArrowDown}
        color={IconColor.primaryDefault}
        data-testid="expand-fee-details-button"
        onClick={() => setExpandFeeDetails(!expandFeeDetails)}
      >
        <Text variant={TextVariant.bodySm} color={IconColor.primaryDefault}>
          {t('feeDetails')}
        </Text>
      </Button>
    </Box>
  );
};

const Layer2GasFeesDetails = ({
  transactionMeta,
  gasEstimate,
}: {
  transactionMeta: TransactionMeta;
  gasEstimate: string;
}) => {
  const fiatFormatter = useFiatFormatter();

  const currentCurrency = useSelector(getCurrentCurrency);
  const conversionRate = useSelector(getConversionRate);

  const nativeCurrencyFees = getEthConversionFromWeiHex({
    value: gasEstimate,
    fromCurrency: EtherDenomination.GWEI,
    numberOfDecimals: 4,
  });
  const currentCurrencyFees = fiatFormatter(
    Number(
      getValueFromWeiHex({
        value: gasEstimate,
        conversionRate,
        fromCurrency: EtherDenomination.GWEI,
        toCurrency: currentCurrency,
        numberOfDecimals: 2,
      }),
    ),
  );

  const layer1GasFee = transactionMeta?.layer1GasFee ?? null;
  const hasLayer1GasFee = layer1GasFee !== null;
  const [expandFeeDetails, setExpandFeeDetails] = useState(false);

  // L1
  const nativeCurrencyL1Fees = layer1GasFee
    ? getEthConversionFromWeiHex({
        value: layer1GasFee,
        fromCurrency: EtherDenomination.GWEI,
        numberOfDecimals: 4,
      })
    : null;

  const currentCurrencyL1Fees = layer1GasFee
    ? fiatFormatter(
        Number(
          getValueFromWeiHex({
            value: layer1GasFee,
            conversionRate,
            fromCurrency: EtherDenomination.GWEI,
            toCurrency: currentCurrency,
            numberOfDecimals: 2,
          }),
        ),
      )
    : null;

  // Total
  const getTransactionFeeTotal = useMemo(() => {
    return addHexes(gasEstimate, (layer1GasFee as string) ?? 0);
  }, [gasEstimate, layer1GasFee]);

  const nativeCurrencyTotalFees = layer1GasFee
    ? getEthConversionFromWeiHex({
        value: getTransactionFeeTotal,
        fromCurrency: EtherDenomination.GWEI,
        numberOfDecimals: 4,
      })
    : null;

  const currentCurrencyTotalFees = layer1GasFee
    ? fiatFormatter(
        Number(
          getValueFromWeiHex({
            value: getTransactionFeeTotal,
            conversionRate,
            fromCurrency: EtherDenomination.GWEI,
            toCurrency: currentCurrency,
            numberOfDecimals: 2,
          }),
        ),
      )
    : null;

  return (
    <>
      {hasLayer1GasFee && (
        <Layer2GasFeesExpandBtn
          expandFeeDetails={expandFeeDetails}
          setExpandFeeDetails={setExpandFeeDetails}
        />
      )}
      {hasLayer1GasFee && expandFeeDetails && (
        <>
          <Layer2FeesRow
            currentCurrencyFees={currentCurrencyFees}
            nativeCurrencyFees={nativeCurrencyFees}
          />
          <Layer1FeesRow
            currentCurrencyL1Fees={currentCurrencyL1Fees}
            nativeCurrencyL1Fees={nativeCurrencyL1Fees}
          />
          <TotalFeesRow
            currentCurrencyTotalFees={currentCurrencyTotalFees}
            nativeCurrencyTotalFees={nativeCurrencyTotalFees}
          />
        </>
      )}
    </>
  );
};

const TotalGasFees = ({
  nativeCurrencyFees,
}: {
  nativeCurrencyFees: string | undefined;
}) => {
  return (
    <ConfirmInfoRow
      label="Total"
      variant={ConfirmInfoRowVariant.Default}
      tooltip="total tooltip"
    >
      <Text>{nativeCurrencyFees}</Text>
    </ConfirmInfoRow>
  );
};

const Divider = () => (
  <Box
    borderColor={BorderColor.borderMuted}
    borderWidth={1}
    width={BlockSize.Full}
  />
);

const GasTimings = ({
  maxFeePerGas,
  maxPriorityFeePerGas,
}: {
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}) => {
  return (
    <ConfirmInfoRow label="Gas speed" variant={ConfirmInfoRowVariant.Default}>
      <Box display={Display.Flex} alignItems={AlignItems.center}>
        {/* TODO: Fix bug in the gas timing component after selection is made */}
        <GasTiming
          maxFeePerGas={maxFeePerGas}
          maxPriorityFeePerGas={maxPriorityFeePerGas}
        />
      </Box>
    </ConfirmInfoRow>
  );
};

const EditGasFeesRow = ({
  currentCurrencyFees,
  nativeCurrencyFees,
  supportsEIP1559,
  setShowCustomizeGasPopover,
}: {
  currentCurrencyFees: string;
  nativeCurrencyFees: string | undefined;
  supportsEIP1559: boolean;
  setShowCustomizeGasPopover: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <ConfirmInfoRow
      label="Estimated fee"
      variant={ConfirmInfoRowVariant.Default}
      tooltip="estimated fee tooltip"
    >
      <Box
        display={Display.Flex}
        flexDirection={FlexDirection.Row}
        justifyContent={JustifyContent.spaceBetween}
        alignItems={AlignItems.center}
        textAlign={TextAlign.Center}
        style={{ flexGrow: '1' }}
      >
        <Box
          display={Display.Flex}
          flexDirection={FlexDirection.Row}
          justifyContent={JustifyContent.spaceEvenly}
          alignItems={AlignItems.center}
          textAlign={TextAlign.Center}
          style={{ flexGrow: '1' }}
        >
          <Text color={TextColor.textAlternative}>{currentCurrencyFees}</Text>
          <Text color={TextColor.textAlternative}>{nativeCurrencyFees}</Text>
        </Box>

        <EditGasIconButton
          supportsEIP1559={supportsEIP1559}
          setShowCustomizeGasPopover={setShowCustomizeGasPopover}
        />
      </Box>
    </ConfirmInfoRow>
  );
};

const GasFeeInfo = ({
  currentCurrencyFees,
  nativeCurrencyFees,
  supportsEIP1559,
  setShowCustomizeGasPopover,
  maxFeePerGas,
  maxPriorityFeePerGas,
}: {
  currentCurrencyFees: string;
  nativeCurrencyFees: string | undefined;
  supportsEIP1559: boolean;
  setShowCustomizeGasPopover: Dispatch<SetStateAction<boolean>>;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}) => {
  return (
    <>
      <EditGasFeesRow
        currentCurrencyFees={currentCurrencyFees}
        nativeCurrencyFees={nativeCurrencyFees}
        supportsEIP1559={supportsEIP1559}
        setShowCustomizeGasPopover={setShowCustomizeGasPopover}
      />
      {supportsEIP1559 && (
        <GasTimings
          maxFeePerGas={maxFeePerGas}
          maxPriorityFeePerGas={maxPriorityFeePerGas}
        />
      )}
      <Divider />
      <TotalGasFees nativeCurrencyFees={nativeCurrencyFees} />
    </>
  );
};

export const RedesignedGasFees = ({
  transactionMeta,
}: {
  transactionMeta: TransactionMeta;
}) => {
  if (!transactionMeta?.txParams) {
    return null;
  }

  const [showCustomizeGasPopover, setShowCustomizeGasPopover] = useState(false);
  const closeCustomizeGasPopover = () => setShowCustomizeGasPopover(false);
  const { supportsEIP1559 } = useSupportsEIP1559(transactionMeta);

  const { maxFeePerGas, maxPriorityFeePerGas } =
    useEIP1559TxFees(transactionMeta);

  const gasEstimate = getGasEstimate(
    transactionMeta,
    supportsEIP1559,
    maxFeePerGas,
    maxPriorityFeePerGas,
  );

  const nativeCurrencyFees = getEthConversionFromWeiHex({
    value: gasEstimate,
    fromCurrency: EtherDenomination.GWEI,
    numberOfDecimals: 4,
  });

  const currentCurrency = useSelector(getCurrentCurrency);
  const conversionRate = useSelector(getConversionRate);

  const fiatFormatter = useFiatFormatter();

  const currentCurrencyFees = fiatFormatter(
    Number(
      getValueFromWeiHex({
        value: gasEstimate,
        conversionRate,
        fromCurrency: EtherDenomination.GWEI,
        toCurrency: currentCurrency,
        numberOfDecimals: 2,
      }),
    ),
  );

  return (
    <>
      <GasFeeInfo
        currentCurrencyFees={currentCurrencyFees}
        nativeCurrencyFees={nativeCurrencyFees}
        supportsEIP1559={supportsEIP1559}
        setShowCustomizeGasPopover={setShowCustomizeGasPopover}
        maxFeePerGas={maxFeePerGas}
        maxPriorityFeePerGas={maxPriorityFeePerGas}
      />

      <Layer2GasFeesDetails
        transactionMeta={transactionMeta}
        gasEstimate={gasEstimate}
      />

      {!supportsEIP1559 && showCustomizeGasPopover && (
        <Type0TxGasModal
          closeCustomizeGasPopover={closeCustomizeGasPopover}
          transactionMeta={transactionMeta}
        />
      )}
      {supportsEIP1559 && <Type2TxGasModal />}
    </>
  );
};
