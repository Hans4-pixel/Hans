import React from 'react';
import AdvancedTab from './advanced-tab.component';

export default {
  title: 'Pages/Settings/AdvancedTab',
  id: __filename,
  argTypes: {
    warning: { control: 'text' },
    useNonceField: { control: 'boolean' },
    sendHexData: { control: 'boolean' },
    advancedInlineGas: { control: 'boolean' },
    showFiatInTestnets: { control: 'boolean' },
    threeBoxSyncingAllowed: { control: 'boolean' },
    threeBoxDisabled: { control: 'boolean' },
    useLedgerLive: { control: 'boolean' },
    dismissSeedBackUpReminder: { control: 'boolean' },
  },
};

export const DefaultStory = (args) => {
  return (
    <div style={{ flex: 1, height: 500 }}>
      <AdvancedTab
        setAutoLockTimeLimit={() => undefined}
        setShowFiatConversionOnTestnetsPreference={() => undefined}
        setShowTestNetworks={() => undefined}
        setThreeBoxSyncingPermission={() => undefined}
        setIpfsGateway={() => undefined}
        setLedgerTransportPreference={() => undefined}
        setDismissSeedBackUpReminder={() => undefined}
        setUseNonceField={() => undefined}
        setHexDataFeatureFlag={() => undefined}
        displayWarning={() => undefined}
        history={{ push: () => undefined }}
        showResetAccountConfirmationModal={() => undefined}
        setAdvancedInlineGasFeatureFlag={() => undefined}
        ipfsGateway="ipfs-gateway"
        {...args}
      />
    </div>
  );
};

DefaultStory.storyName = 'Default';
DefaultStory.args = {
  warning: 'Warning Sample',
  useNonceField: false,
  sendHexData: false,
  advancedInlineGas: false,
  showFiatInTestnets: false,
  threeBoxSyncingAllowed: false,
  threeBoxDisabled: false,
  useLedgerLive: false,
  dismissSeedBackUpReminder: false,
};
