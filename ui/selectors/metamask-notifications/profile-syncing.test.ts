import { selectIsProfileSyncingEnabled } from './profile-syncing';

describe('Profile Syncing Selectors', () => {
  const mockState = {
    metamask: {
      isProfileSyncingEnabled: true,
      isProfileSyncingUpdateLoading: false,
      hasFinishedAddingAccountsWithBalance: true,
    },
  };

  it('should select the Profile Syncing status', () => {
    expect(selectIsProfileSyncingEnabled(mockState)).toBe(true);
  });
});
