/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
import { TransactionEnvelopeType } from '@metamask/transaction-controller';
import { DAPP_URL, unlockWallet } from '../../../helpers';
import { Mockttp } from '../../../mock-e2e';
import SetApprovalForAllTransactionConfirmation from '../../../page-objects/pages/set-approval-for-all-transaction-confirmation';
import TestDapp from '../../../page-objects/pages/test-dapp';
import GanacheContractAddressRegistry from '../../../seeder/ganache-contract-address-registry';
import { Driver } from '../../../webdriver/driver';
import { withRedesignConfirmationFixtures } from '../helpers';
import { TestSuiteArguments } from './shared';

const { SMART_CONTRACTS } = require('../../../seeder/smart-contracts');

describe('Confirmation Redesign ERC721 setApprovalForAll', function () {
  describe('Submit a transaction @no-mmi', function () {
    it('Sends a type 0 transaction (Legacy)', async function () {
      await withRedesignConfirmationFixtures(
        this.test?.fullTitle(),
        TransactionEnvelopeType.legacy,
        async ({ driver, contractRegistry }: TestSuiteArguments) => {
          await createTransactionAssertDetailsAndConfirm(
            driver,
            contractRegistry,
          );
        },
        mocks,
        SMART_CONTRACTS.NFTS,
      );
    });

    it('Sends a type 2 transaction (EIP1559)', async function () {
      await withRedesignConfirmationFixtures(
        this.test?.fullTitle(),
        TransactionEnvelopeType.feeMarket,
        async ({ driver, contractRegistry }: TestSuiteArguments) => {
          await createTransactionAssertDetailsAndConfirm(
            driver,
            contractRegistry,
          );
        },
        mocks,
        SMART_CONTRACTS.NFTS,
      );
    });
  });
});

async function mocks(server: Mockttp) {
  return [await mocked4BytesSetApprovalForAll(server)];
}

export async function mocked4BytesSetApprovalForAll(mockServer: Mockttp) {
  return await mockServer
    .forGet('https://www.4byte.directory/api/v1/signatures/')
    .withQuery({ hex_signature: '0xa22cb465' })
    .always()
    .thenCallback(() => ({
      statusCode: 200,
      json: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            bytes_signature: '¢,´e',
            created_at: '2018-04-11T21:47:39.980645Z',
            hex_signature: '0xa22cb465',
            id: 29659,
            text_signature: 'setApprovalForAll(address,bool)',
          },
        ],
      },
    }));
}

async function createTransactionAssertDetailsAndConfirm(
  driver: Driver,
  contractRegistry?: GanacheContractAddressRegistry,
) {
  await unlockWallet(driver);

  const contractAddress = await (
    contractRegistry as GanacheContractAddressRegistry
  ).getContractAddress(SMART_CONTRACTS.NFTS);

  const testDapp = new TestDapp(driver);

  await testDapp.open({ contractAddress, url: DAPP_URL });
  await testDapp.clickERC721SetApprovalForAllButton();

  const setApprovalForAllConfirmation =
    new SetApprovalForAllTransactionConfirmation(driver);

  await setApprovalForAllConfirmation.check_setApprovalForAllTitle();
  await setApprovalForAllConfirmation.check_setApprovalForAllSubHeading();

  await setApprovalForAllConfirmation.clickScrollToBottomButton();
  await setApprovalForAllConfirmation.clickFooterConfirmButton();
}
