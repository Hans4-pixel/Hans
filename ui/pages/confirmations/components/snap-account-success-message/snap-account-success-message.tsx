import React from 'react';

import { Text } from '../../../../components/component-library';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { SnapAccountCard } from '../../../remove-snap-account';

const SnapAccountSuccessMessage = ({
  message,
  address,
  learnMoreLink,
}: {
  message: string;
  address: string;
  learnMoreLink?: string;
}) => {
  const t = useI18nContext();

  return (
    <>
      <SnapAccountCard address={address} />
      <Text>
        {message}
        {learnMoreLink && (
          <>
            {' '}
            <a href={learnMoreLink} rel="noopener noreferrer" target="_blank">
              {t('learnMoreUpperCase') as string}
            </a>
          </>
        )}
      </Text>
    </>
  );
};

export default SnapAccountSuccessMessage;
