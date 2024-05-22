/*
NOTICE:
This Snow + LavaMoat scuttling integration is currently being used
with an experimental API (https://github.com/LavaMoat/LavaMoat/pull/462).
Changing this code must be done cautiously to avoid breaking the app!
*/

// eslint-disable-next-line import/unambiguous
(function () {
  const log = console.log.bind(console);
  // eslint-disable-next-line no-undef
  const isWorker = !self.document;
  const msg =
    'Snow detected a new realm creation attempt in MetaMask. Performing scuttling on new realm.';

  // eslint-disable-next-line no-undef
  const chromeExtensionId = chrome && chrome.runtime && chrome.runtime.id;
  const tamedFetch = (path) => {
    const regex = new RegExp(
      `^chrome-extension://${chromeExtensionId}/.*?/images/.*`,
      'u',
    );
    if (regex.test(path)) {
      return fetch(path);
    }
    throw new Error(
      'Unscuttled fetch can only be used on images within the extension',
    );
  };

  // eslint-disable-next-line no-undef
  Object.defineProperty(self, 'SCUTTLER', {
    value: (realm, scuttle) => {
      const scuttleWithRestrictedException = (_ref, restrictedExceptions) => {
        const ref = _ref;
        for (const key in restrictedExceptions) {
          if (Object.hasOwn(restrictedExceptions, key)) {
            ref[key] = restrictedExceptions[key];
          }
        }
        return scuttle(ref);
      };
      if (isWorker) {
        chromeExtensionId
          ? scuttleWithRestrictedException(realm, { fetch: tamedFetch })
          : scuttle(realm);
      } else {
        // eslint-disable-next-line no-undef
        self.SNOW((win) => {
          log(msg, win);
          chromeExtensionId
            ? scuttleWithRestrictedException(win, { fetch: tamedFetch })
            : scuttle(win);
        }, realm);
      }
    },
  });
})();
