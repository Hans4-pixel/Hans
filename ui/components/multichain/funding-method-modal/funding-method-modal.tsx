import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { CaipChainId } from '@metamask/utils';
import {
  Modal,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  Text,
  IconName,
} from '../../component-library';
import {
  TextVariant,
  TextAlign,
} from '../../../helpers/constants/design-system';
import { getMultichainCurrentNetwork } from '../../../selectors/multichain';
import useRamps from '../../../hooks/ramps/useRamps/useRamps';
import { getPortfolioUrl } from '../../../helpers/utils/portfolio';
import {
  getMetaMetricsId,
  getParticipateInMetaMetrics,
  getDataCollectionForMarketing,
  getSelectedAccount,
} from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ChainId } from '../../../../shared/constants/network';
import FundingMethodItem from './funding-method-item';

type FundingMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onClickReceive: () => void;
};

export const FundingMethodModal: React.FC<FundingMethodModalProps> = ({
  isOpen,
  onClose,
  title,
  onClickReceive,
}) => {
  const t = useI18nContext();
  const { openBuyCryptoInPdapp } = useRamps();
  const { address: accountAddress } = useSelector(getSelectedAccount);
  const { chainId } = useSelector(getMultichainCurrentNetwork);
  const metaMetricsId = useSelector(getMetaMetricsId);
  const isMetaMetricsEnabled = useSelector(getParticipateInMetaMetrics);
  const isMarketingEnabled = useSelector(getDataCollectionForMarketing);

  const handleTransferCryptoClick = useCallback(() => {
    const url = getPortfolioUrl(
      'transfer',
      'ext_funding_method_modal',
      metaMetricsId,
      isMetaMetricsEnabled,
      isMarketingEnabled,
      accountAddress,
      'transfer',
    );
    global.platform.openTab({ url });
  }, [metaMetricsId, isMetaMetricsEnabled, isMarketingEnabled]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} data-testid="funding-method-modal">
      <ModalOverlay />
      <ModalContent modalDialogProps={{ padding: 0 }}>
        <ModalHeader paddingBottom={2} onClose={onClose}>
          <Text variant={TextVariant.headingSm} textAlign={TextAlign.Center}>
            {title}
          </Text>
        </ModalHeader>
        <FundingMethodItem
          icon={IconName.Card}
          title={t('buyCrypto')}
          description={t('buyFirstCrypto')}
          onClick={() => openBuyCryptoInPdapp(chainId as ChainId | CaipChainId)}
        />
        <FundingMethodItem
          icon={IconName.Received}
          title={t('receiveCrypto')}
          description={t('depositCrypto')}
          onClick={onClickReceive}
        />
        <FundingMethodItem
          icon={IconName.Link}
          title={t('transferCrypto')}
          description={t('linkCentralizedExchanges')}
          onClick={handleTransferCryptoClick}
        />
      </ModalContent>
    </Modal>
  );
};
