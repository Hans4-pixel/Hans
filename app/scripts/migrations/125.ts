import { cloneDeep } from 'lodash';
import { hasProperty, isObject } from '@metamask/utils';

type VersionedData = {
  meta: { version: number };
  data: Record<string, unknown>;
};

export const version = 125;

/**
 * This migration removes any dangling instances of SelectedNetworkController.perDomainNetwork
 *
 * @param originalVersionedData - Versioned MetaMask extension state, exactly what we persist to dist.
 * @param originalVersionedData.meta - State metadata.
 * @param originalVersionedData.meta.version - The current state version.
 * @param originalVersionedData.data - The persisted MetaMask state, keyed by controller.
 * @returns Updated versioned MetaMask extension state.
 */
export async function migrate(
  originalVersionedData: VersionedData,
): Promise<VersionedData> {
  const versionedData = cloneDeep(originalVersionedData);
  versionedData.meta.version = version;
  transformState(versionedData.data);
  return versionedData;
}

// TODO: Replace `any` with specific type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformState(state: Record<string, any>) {
  if (!hasProperty(state, 'SelectedNetworkController')) {
    return state;
  }

  if (!isObject(state.SelectedNetworkController)) {
    global.sentry?.captureException?.(
      new Error(
        `state.SelectedNetworkController is type: ${typeof state.SelectedNetworkController}`,
      ),
    );
    state.SelectedNetworkController = { domains: {} };
  } else if (hasProperty(state.SelectedNetworkController, 'perDomainNetwork')) {
    state.SelectedNetworkController = {
      domains: {},
    };
  }

  return state;
}
