import React from 'react';

import ActionableMessage from '../../../components/ui/actionable-message/actionable-message';
import Box from '../../../components/ui/box';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { useI18nContext } from '../../../hooks/useI18nContext';

const LowGasWarning = () => {
  const { estimateToUse } = useGasFeeContext();
  const t = useI18nContext();

  if (estimateToUse !== 'low') return null;
  return (
    <Box marginTop={20}>
      <ActionableMessage
        className="actionable-message--warning"
        message={t('lowGasWarning')}
        useIcon
      />
    </Box>
  );
};

export default LowGasWarning;
