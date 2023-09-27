import { CHAIN_IDS } from './network';

export const ALLOWED_BRIDGE_CHAIN_IDS = [
  CHAIN_IDS.MAINNET,
  CHAIN_IDS.BSC,
  CHAIN_IDS.POLYGON,
  CHAIN_IDS.ZKSYNC_ERA,
  CHAIN_IDS.AVALANCHE,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.ARBITRUM,
];

export const ALLOWED_BRIDGE_TOKEN_ADDRESSES = {
  [CHAIN_IDS.MAINNET]: [
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    '0x8965349fb649a33a30cbfda057d8ec2c48abe2a2',
  ],
  [CHAIN_IDS.BSC]: [
    '0x55d398326f99059ff775485246999027b3197955',
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    '0xcc42724c6683b7e57334c4e856f4c9965ed682bd',
    '0x1ce0c2827e2ef14d5c4f29a091d735a204794041',
  ],
  [CHAIN_IDS.POLYGON]: [
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b',
  ],
  [CHAIN_IDS.AVALANCHE]: [
    '0xc7198437980c041c805a1edcba50c1ce5db95118',
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
  ],
  [CHAIN_IDS.OPTIMISM]: [
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  ],
  [CHAIN_IDS.ARBITRUM]: [
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  ],
};
