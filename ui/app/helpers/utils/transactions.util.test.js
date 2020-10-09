import * as utils from './transactions.util'
import assert from 'assert'

describe('Transactions utils', function () {
  describe('getTokenData', function () {
    it('should return token data', function () {
      const tokenData = utils.getTokenData(
        '0xa9059cbb00000000000000000000000050a9d56c2b8ba9a5c7f2c08c3d26e0499f23a7060000000000000000000000000000000000000000000000000000000000004e20'
      )
      assert.ok(tokenData)
      const { name, params } = tokenData
      assert.equal(name, 'transfer')
      const [to, value] = params
      assert.equal(to.name, '_to')
      assert.equal(to.type, 'address')
      assert.equal(value.name, '_value')
      assert.equal(value.type, 'uint256')
    })

    it('should not throw errors when called without arguments', function () {
      assert.doesNotThrow(() => utils.getTokenData())
    })
  })

  describe('getStatusKey', function () {
    it('should return the correct status', function () {
      const tests = [
        {
          transaction: {
            status: 'confirmed',
            txReceipt: {
              outcomeStatus: '0x1',
            },
          },
          expected: 'failed',
        },
        {
          transaction: {
            status: 'confirmed',
            txReceipt: {
              outcomeStatus: '0x0',
            },
          },
          expected: 'confirmed',
        },
        {
          transaction: {
            status: 'pending',
          },
          expected: 'pending',
        },
      ]

      tests.forEach(({ transaction, expected }) => {
        assert.equal(utils.getStatusKey(transaction), expected)
      })
    })
  })
})
