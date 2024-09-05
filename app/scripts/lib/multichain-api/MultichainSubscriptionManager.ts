import EventEmitter from 'events';
import { NetworkController } from '@metamask/network-controller';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { Hex, parseCaipChainId } from '@metamask/utils';
import { toHex } from '@metamask/controller-utils';
import { ScopeString, ExternalScopeString } from './scope';

export type SubscriptionManager = {
  events: EventEmitter;
  destroy?: () => void;
};

type subscriptionNotificationEvent = {
  jsonrpc: '2.0';
  method: 'eth_subscription';
  params: {
    subscription: Hex;
    result: unknown;
  };
};

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const createSubscriptionManager = require('@metamask/eth-json-rpc-filters/subscriptionManager');

type MultichainSubscriptionManagerOptions = {
  findNetworkClientIdByChainId: NetworkController['findNetworkClientIdByChainId'];
  getNetworkClientById: NetworkController['getNetworkClientById'];
};

export default class MultichainSubscriptionManager extends SafeEventEmitter {
  private subscriptionsByChain: {
    [scope: string]: {
      [domain: string]: (message: unknown) => void;
    };
  };

  private findNetworkClientIdByChainId: NetworkController['findNetworkClientIdByChainId'];

  private getNetworkClientById: NetworkController['getNetworkClientById'];

  public subscriptionManagerByChain: { [scope: string]: SubscriptionManager };

  private subscriptionsCountByScope: { [scope: string]: number };

  constructor(options: MultichainSubscriptionManagerOptions) {
    super();
    this.findNetworkClientIdByChainId = options.findNetworkClientIdByChainId;
    this.getNetworkClientById = options.getNetworkClientById;
    this.subscriptionManagerByChain = {};
    this.subscriptionsByChain = {};
    this.subscriptionsCountByScope = {};
  }

  onNotification(
    scope: ScopeString,
    domain: string,
    { method, params }: subscriptionNotificationEvent,
  ) {
    this.emit('notification', domain, {
      method: 'wallet_notify',
      params: {
        scope,
        notification: { method, params },
      },
    });
  }

  subscribe(scope: ScopeString, domain: string) {
    let subscriptionManager;
    if (this.subscriptionManagerByChain[scope]) {
      subscriptionManager = this.subscriptionManagerByChain[scope];
    } else {
      const networkClientId = this.findNetworkClientIdByChainId(
        toHex(parseCaipChainId(scope).reference),
      );
      const networkClient = this.getNetworkClientById(networkClientId);
      subscriptionManager = createSubscriptionManager({
        blockTracker: networkClient.blockTracker,
        provider: networkClient.provider,
      });
      this.subscriptionManagerByChain[scope] = subscriptionManager;
    }
    this.subscriptionsByChain[scope] = this.subscriptionsByChain[scope] || {};
    this.subscriptionsByChain[scope][domain] = (message) => {
      this.onNotification(scope, domain, message);
    };
    subscriptionManager.events.on(
      'notification',
      this.subscriptionsByChain[scope][domain],
    );
    this.subscriptionsCountByScope[scope] ??= 0;
    this.subscriptionsCountByScope[scope] += 1;
    return subscriptionManager;
  }

  unsubscribe(scope: ExternalScopeString, domain: string) {
    const subscriptionManager: SubscriptionManager =
      this.subscriptionManagerByChain[scope];
    if (subscriptionManager && this.subscriptionsByChain[scope][domain]) {
      subscriptionManager.events.off(
        'notification',
        this.subscriptionsByChain[scope][domain],
      );
      delete this.subscriptionsByChain[scope][domain];
    }
    if (this.subscriptionsCountByScope[scope]) {
      this.subscriptionsCountByScope[scope] -= 1;
      if (this.subscriptionsCountByScope[scope] === 0) {
        // might be destroyed already
        if (subscriptionManager.destroy) {
          subscriptionManager.destroy();
        }
        delete this.subscriptionsCountByScope[scope];
        delete this.subscriptionManagerByChain[scope];
        delete this.subscriptionsByChain[scope];
      }
    }
  }

  unsubscribeAll() {
    Object.entries(this.subscriptionsByChain).forEach(
      ([scope, domainObject]) => {
        Object.entries(domainObject).forEach(([domain]) => {
          this.unsubscribe(scope, domain);
        });
      },
    );
  }

  unsubscribeScope(scope: string) {
    Object.entries(this.subscriptionsByChain).forEach(
      ([_scope, domainObject]) => {
        if (scope === _scope) {
          Object.entries(domainObject).forEach(([_domain]) => {
            this.unsubscribe(_scope, _domain);
          });
        }
      },
    );
  }

  unsubscribeDomain(domain: string) {
    Object.entries(this.subscriptionsByChain).forEach(
      ([scope, domainObject]) => {
        Object.entries(domainObject).forEach(([_domain]) => {
          if (domain === _domain) {
            this.unsubscribe(scope, _domain);
          }
        });
      },
    );
  }
}
