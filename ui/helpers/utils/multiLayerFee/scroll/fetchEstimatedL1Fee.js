import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { hexToDecimal } from '../../../../../shared/modules/conversion.utils';
import buildUnserializedTransaction from '../buildUnserializedTransaction';

// Snippet of the ABI that we need -- matches OP
// If needed for reference, contract if available here:
// https://github.com/scroll-tech/scroll/blob/develop/contracts/src/L2/predeploys/IL1GasPriceOracle.sol
const SCROLL_GAS_PRICE_ORACLE_ABI = [
  {
    inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
    name: 'getL1Fee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// BlockExplorer link: https://scrollscan.com/address/0x5300000000000000000000000000000000000002#code
const SCROLL_GAS_PRICE_ORACLE_ADDRESS =
  '0x5300000000000000000000000000000000000002';

export default async function fetchEstimatedL1Fee(
  chainId,
  txMeta,
  ethersProvider,
) {
  console.log('scroll fetchEstimatedL1Fee called.');

  const chainIdAsDecimalNumber = Number(hexToDecimal(chainId));
  const provider = global.ethereumProvider
    ? new Web3Provider(global.ethereumProvider, chainIdAsDecimalNumber)
    : ethersProvider;

  if (process.env.IN_TEST) {
    provider.detectNetwork = async () => ({
      name: 'scroll',
      chainId: chainIdAsDecimalNumber,
    });
  }
  const contract = new Contract(
    SCROLL_GAS_PRICE_ORACLE_ADDRESS,
    SCROLL_GAS_PRICE_ORACLE_ABI,
    provider,
  );
  const serializedTransaction =
    buildUnserializedTransaction(txMeta).serialize();
  console.log('serializedTransaction:', serializedTransaction);
  console.log('unserializedTransaction:', buildUnserializedTransaction(txMeta));
  const result = await contract.getL1Fee(serializedTransaction);

  console.log('est l1 fee:', result?.toHexString());
  return result?.toHexString();
}
