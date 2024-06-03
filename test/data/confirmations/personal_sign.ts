export const PERSONAL_SIGN_SENDER_ADDRESS = '0x8eeee1781fd885ff5ddef7789486676961873d12';

export const unapprovedPersonalSignMsg = {
  id: '0050d5b0-c023-11ee-a0cb-3390a510a0ab',
  status: 'unapproved',
  time: new Date().getTime(),
  type: 'personal_sign',
  securityProviderResponse: null,
  msgParams: {
    from: PERSONAL_SIGN_SENDER_ADDRESS,
    data: '0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765',
    origin: 'https://metamask.github.io',
    siwe: { isSIWEMessage: false, parsedMessage: null },
  },
};

export const signatureRequestSIWE = {
  id: '210ca3b0-1ccb-11ef-b096-89c4d726ebb5',
  securityAlertResponse: {
    reason: 'loading',
    result_type: 'validation_in_progress',
    securityAlertId: 'b826df20-2eda-41bf-becf-6a100141a8be',
  },
  status: 'unapproved',
  time: 1716884423019,
  type: 'personal_sign',
  msgParams: {
    from: '0x935e73edb9ff52e23bac7f7e049a1ecd06d05477',
    data: '0x6d6574616d61736b2e6769746875622e696f2077616e747320796f7520746f207369676e20696e207769746820796f757220457468657265756d206163636f756e743a0a3078393335653733656462396666353265323362616337663765303433613165636430366430353437370a0a492061636365707420746865204d6574614d61736b205465726d73206f6620536572766963653a2068747470733a2f2f636f6d6d756e6974792e6d6574616d61736b2e696f2f746f730a0a5552493a2068747470733a2f2f6d6574616d61736b2e6769746875622e696f0a56657273696f6e3a20310a436861696e2049443a20310a4e6f6e63653a2033323839313735370a4973737565642041743a20323032312d30392d33305431363a32353a32342e3030305a',
    signatureMethod: 'personal_sign',
    origin: 'https://metamask.github.io',
    siwe: {
      isSIWEMessage: true,
      parsedMessage: {
        domain: 'metamask.github.io',
        address: '0x935e73edb9ff52e23bac7f7e049a1ecd06d05477',
        statement:
          'I accept the MetaMask Terms of Service: https://community.metamask.io/tos',
        uri: 'https://metamask.github.io',
        version: '1',
        chainId: 1,
        nonce: '32891757',
        issuedAt: '2021-09-30T16:25:24.000Z',
      },
    },
  },
};
