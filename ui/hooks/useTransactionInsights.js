import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { SeverityLevel } from '@metamask/snaps-utils';
import { stripHexPrefix } from '../../shared/modules/hexstring-utils';
import { TransactionType } from '../../shared/constants/transaction';
import { Tab } from '../components/ui/tabs';
import DropdownTab from '../components/ui/tabs/snaps/dropdown-tab';
import { SnapInsight } from '../components/app/confirm-page-container/snaps/snap-insight';
import { getInsightSnaps, getSubjectMetadata } from '../selectors';
import { getSnapName } from '../helpers/utils/util';
import { useTransactionInsightSnaps } from './snaps/useTransactionInsightSnaps';

const isAllowedTransactionTypes = (transactionType) =>
  transactionType === TransactionType.contractInteraction ||
  transactionType === TransactionType.simpleSend ||
  transactionType === TransactionType.tokenMethodSafeTransferFrom ||
  transactionType === TransactionType.tokenMethodTransferFrom ||
  transactionType === TransactionType.tokenMethodTransfer;

// A hook was needed to return JSX here as the way Tabs work JSX has to be included in
// https://github.com/MetaMask/metamask-extension/blob/develop/ui/components/app/confirm-page-container/confirm-page-container-content/confirm-page-container-content.component.js#L129
// Thus it is not possible to use React Component here
const useTransactionInsights = ({ txData }) => {
  const { txParams, chainId, origin } = txData;
  const caip2ChainId = `eip155:${stripHexPrefix(chainId)}`;
  const insightSnaps = useSelector(getInsightSnaps);
  const subjectMetadata = useSelector(getSubjectMetadata);

  const [selectedInsightSnapId, setSelectedInsightSnapId] = useState(
    insightSnaps[0]?.id,
  );

  const insightHookParams = {
    transaction: txParams,
    chainId: caip2ChainId,
    origin,
    insightSnaps,
    ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-mmi,build-beta)
    insightSnapId: selectedInsightSnapId,
    ///: END:ONLY_INCLUDE_IN
  };

  const { data, loading } = useTransactionInsightSnaps({
    ...insightHookParams,
    ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-mmi,build-beta)
    eagerFetching: false,
    ///: END:ONLY_INCLUDE_IN
  });

  useEffect(() => {
    if (insightSnaps.length && !selectedInsightSnapId) {
      setSelectedInsightSnapId(insightSnaps[0]?.id);
    }
  }, [insightSnaps, selectedInsightSnapId, setSelectedInsightSnapId]);

  if (!isAllowedTransactionTypes(txData.type) || !insightSnaps.length) {
    return null;
  }

  const selectedSnap = insightSnaps.find(
    ({ id }) => id === selectedInsightSnapId,
  );

  // TODO(hbmalik88): refactor this into another component once we've redone
  // the logic inside of tabs.component.js is re-done to account for nested tabs
  let insightComponent;

  if (insightSnaps.length === 1) {
    insightComponent = (
      <Tab
        className="confirm-page-container-content__tab"
        name={getSnapName(selectedSnap?.id, subjectMetadata[selectedSnap?.id])}
      >
        <SnapInsight
          data={data?.[0]}
          loading={loading}
          ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-mmi,build-beta)
          insightHookParams={insightHookParams}
          ///: END:ONLY_INCLUDE_IN
        />
      </Tab>
    );
  } else if (insightSnaps.length > 1) {
    const dropdownOptions = insightSnaps?.map(({ id }) => {
      const name = getSnapName(id, subjectMetadata[id]);
      return {
        value: id,
        name,
      };
    });

    const selectedSnapData = data?.find(
      (promise) => promise?.snapId === selectedInsightSnapId,
    );

    insightComponent = (
      <DropdownTab
        className="confirm-page-container-content__tab"
        options={dropdownOptions}
        selectedOption={selectedInsightSnapId}
        onChange={(snapId) => setSelectedInsightSnapId(snapId)}
      >
        <SnapInsight
          loading={loading}
          data={selectedSnapData}
          ///: BEGIN:ONLY_INCLUDE_IN(build-main,build-mmi,build-beta)
          insightHookParams={insightHookParams}
          ///: END:ONLY_INCLUDE_IN
        />
      </DropdownTab>
    );
  }

  const warnings = data?.reduce((warningsArr, promise) => {
    if (promise.response?.severity === SeverityLevel.Critical) {
      const {
        snapId,
        response: { content },
      } = promise;
      warningsArr.push({ snapId, content });
    }
    return warningsArr;
  }, []);

  return data ? { insightComponent, warnings } : null;
};

export default useTransactionInsights;
