import { migrate, version } from './128';

const oldVersion = 127;

describe(`migration #${version}`, () => {
  it('updates the version metadata', async () => {
    const oldStorage = {
      meta: { version: oldVersion },
      data: {},
    };

    const newStorage = await migrate(oldStorage);

    expect(newStorage.meta).toStrictEqual({ version });
  });

  it('Does nothing if `networkConfigurations` is not in the network controller state', async () => {
    const oldState = {
      NetworkController: {
        selectedNetworkClientId: 'mainnet',
      },
    };

    const transformedState = await migrate({
      meta: { version: oldVersion },
      data: oldState,
    });

    expect(transformedState.data).toStrictEqual(oldState);
  });

  it('Updates MATIC ticker to POL in networkConfigurations', async () => {
    const oldState = {
      NetworkController: {
        networkConfigurations: {
          '0x89': {
            chainId: '0x89',
            ticker: 'MATIC',
          },
        },
      },
    };

    const expectedState = {
      NetworkController: {
        networkConfigurations: {
          '0x89': {
            chainId: '0x89',
            ticker: 'POL',
          },
        },
      },
    };

    const transformedState = await migrate({
      meta: { version: oldVersion },
      data: oldState,
    });

    expect(transformedState.data).toStrictEqual(expectedState);
  });

  it('Does not update tickers for other network configurations', async () => {
    const oldState = {
      NetworkController: {
        networkConfigurations: {
          '0x89': {
            chainId: '0x89',
            ticker: 'MATIC',
          },
          '0x1': {
            chainId: '0x1',
            ticker: 'ETH',
          },
        },
      },
    };

    const expectedState = {
      NetworkController: {
        networkConfigurations: {
          '0x89': {
            chainId: '0x89',
            ticker: 'POL',
          },
          '0x1': {
            chainId: '0x1',
            ticker: 'ETH',
          },
        },
      },
    };

    const transformedState = await migrate({
      meta: { version: oldVersion },
      data: oldState,
    });

    expect(transformedState.data).toStrictEqual(expectedState);
  });

  it('Does nothing if the ticker is already POL for the 0x89 chainId', async () => {
    const oldState = {
      NetworkController: {
        networkConfigurations: {
          '0x89': {
            chainId: '0x89',
            ticker: 'POL',
          },
        },
      },
    };

    const transformedState = await migrate({
      meta: { version: oldVersion },
      data: oldState,
    });

    expect(transformedState.data).toStrictEqual(oldState);
  });

  it('Does nothing if Polygon ChainId (0x89) is not in networkConfigurations', async () => {
    const oldState = {
      NetworkController: {
        networkConfigurations: {
          '0x1': {
            chainId: '0x1',
            ticker: 'ETH',
          },
          '0x2a': {
            chainId: '0x2a',
            ticker: 'KOVAN',
          },
        },
      },
    };

    const transformedState = await migrate({
      meta: { version: oldVersion },
      data: oldState,
    });

    expect(transformedState.data).toStrictEqual(oldState);
  });
});
