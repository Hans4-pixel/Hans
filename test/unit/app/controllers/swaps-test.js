import assert from 'assert'
import sinon from 'sinon'

import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import ObservableStore from 'obs-store'
import { createTestProviderTools } from '../../../stub/provider'
import { DEFAULT_ERC20_APPROVE_GAS } from '../../../../ui/app/helpers/constants/swaps'
import SwapsController from '../../../../app/scripts/controllers/swaps'

const MOCK_FETCH_PARAMS = {
  slippage: 3,
  sourceToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
  sourceDecimals: 18,
  destinationToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  value: '1000000000000000000',
  fromAddress: '0x7F18BB4Dd92CF2404C54CBa1A9BE4A1153bdb078',
  exchangeList: 'zeroExV1',
}

const TEST_AGG_ID = 'zeroExV1'
const MOCK_QUOTES = {
  [TEST_AGG_ID]: {
    trade: {
      data: '0x00',
      from: '0x7F18BB4Dd92CF2404C54CBa1A9BE4A1153bdb078',
      value: '0x17647444f166000',
      gas: '0xe09c0',
      gasPrice: undefined,
      to: '0x9537C111Ea62a8dc39E99718140686f7aD856321',
    },
    sourceAmount: '1000000000000000000000000000000000000',
    destinationAmount: '396493201125465',
    error: null,
    sourceToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    destinationToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    approvalNeeded: null,
    maxGas: 920000,
    averageGas: 312510,
    estimatedRefund: 343090,
    fetchTime: 559,
    aggregator: TEST_AGG_ID,
    aggType: 'AGG',
    slippage: 3,
  },
}
const MOCK_FETCH_METADATA = {
  destinationTokenInfo: {
    symbol: 'FOO',
    decimals: 18,
  },
}

const MOCK_TOKEN_RATES_STORE = new ObservableStore({
  contractExchangeRates: { '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 2 },
})

const MOCK_GET_PROVIDER_CONFIG = () => ({ type: 'FAKE_NETWORK' })

const MOCK_GET_BUFFERED_GAS_LIMIT = async () => ({
  gasLimit: 2000000,
  simulationFails: undefined,
})

const EMPTY_INIT_STATE = {
  swapsState: {
    quotes: {},
    fetchParams: null,
    tokens: null,
    tradeTxId: null,
    approveTxId: null,
    maxMode: false,
    quotesLastFetched: null,
    customMaxGas: '',
    customGasPrice: null,
    selectedAggId: null,
    customApproveTxData: '',
    errorKey: '',
    topAggId: null,
    routeState: '',
  },
}

const sandbox = sinon.createSandbox()
const fetchTradesInfoStub = sandbox.stub()

describe('SwapsController', function () {
  let provider

  before(function () {
    const providerResultStub = {
      // 1 gwei
      eth_gasPrice: '0x0de0b6b3a7640000',
      // by default, all accounts are external accounts (not contracts)
      eth_getCode: '0x',
    }
    provider = createTestProviderTools({ scaffold: providerResultStub })
      .provider
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('constructor', function () {
    it('should setup correctly', function () {
      const swapsController = new SwapsController({
        getBufferedGasLimit: MOCK_GET_BUFFERED_GAS_LIMIT,
        provider,
        getProviderConfig: MOCK_GET_PROVIDER_CONFIG,
        tokenRatesStore: MOCK_TOKEN_RATES_STORE,
        fetchTradesInfo: fetchTradesInfoStub,
      })
      assert.deepStrictEqual(swapsController.store.getState(), EMPTY_INIT_STATE)
      assert.deepStrictEqual(
        swapsController.getBufferedGasLimit,
        MOCK_GET_BUFFERED_GAS_LIMIT,
      )
      assert.strictEqual(swapsController.pollCount, 0)
      assert.deepStrictEqual(
        swapsController.getProviderConfig,
        MOCK_GET_PROVIDER_CONFIG,
      )
    })
  })

  describe('API', function () {
    let swapsController
    beforeEach(function () {
      swapsController = new SwapsController({
        getBufferedGasLimit: MOCK_GET_BUFFERED_GAS_LIMIT,
        provider,
        getProviderConfig: MOCK_GET_PROVIDER_CONFIG,
        tokenRatesStore: MOCK_TOKEN_RATES_STORE,
        fetchTradesInfo: fetchTradesInfoStub,
      })
    })

    describe('setters', function () {
      it('should set selected quote agg id', function () {
        const selectedAggId = 'test'
        swapsController.setSelectedQuoteAggId(selectedAggId)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.selectedAggId,
          selectedAggId,
        )
      })

      it('should set swaps tokens', function () {
        const tokens = []
        swapsController.setSwapsTokens(tokens)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.tokens,
          tokens,
        )
      })

      it('should set trade tx id', function () {
        const tradeTxId = 'test'
        swapsController.setTradeTxId(tradeTxId)
        assert.strictEqual(
          swapsController.store.getState().swapsState.tradeTxId,
          tradeTxId,
        )
      })

      it('should set max mode', function () {
        const maxMode = true
        swapsController.setMaxMode(maxMode)
        assert.strictEqual(
          swapsController.store.getState().swapsState.maxMode,
          maxMode,
        )
      })

      it('should set swaps tx gas price', function () {
        const gasPrice = 1
        swapsController.setSwapsTxGasPrice(gasPrice)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.customGasPrice,
          gasPrice,
        )
      })

      it('should set swaps tx gas limit', function () {
        const gasLimit = '1'
        swapsController.setSwapsTxGasLimit(gasLimit)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.customMaxGas,
          gasLimit,
        )
      })

      it('should set background swap route state', function () {
        const routeState = 'test'
        swapsController.setBackgroundSwapRouteState(routeState)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.routeState,
          routeState,
        )
      })

      it('should set swaps error key', function () {
        const errorKey = 'test'
        swapsController.setSwapsErrorKey(errorKey)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.errorKey,
          errorKey,
        )
      })

      it('should set initial gas estimate', async function () {
        const initialAggId = TEST_AGG_ID
        const baseGasEstimate = 10
        const { maxGas, estimatedRefund } = MOCK_QUOTES[TEST_AGG_ID]

        const { swapsState } = swapsController.store.getState()
        // Set mock quotes in order to have data for the test agg
        swapsController.store.updateState({
          swapsState: { ...swapsState, quotes: MOCK_QUOTES },
        })

        await swapsController.setInitialGasEstimate(
          initialAggId,
          baseGasEstimate,
        )

        const {
          gasLimit: bufferedGasLimit,
        } = await swapsController.getBufferedGasLimit()
        const {
          gasEstimate,
          gasEstimateWithRefund,
        } = swapsController.store.getState().swapsState.quotes[initialAggId]
        assert.strictEqual(gasEstimate, bufferedGasLimit)
        assert.strictEqual(
          gasEstimateWithRefund,
          new BigNumber(maxGas, 10).minus(estimatedRefund, 10).toString(16),
        )
      })

      it('should set custom approve tx data', function () {
        const data = 'test'
        swapsController.setCustomApproveTxData(data)
        assert.deepStrictEqual(
          swapsController.store.getState().swapsState.customApproveTxData,
          data,
        )
      })
    })

    describe('fetchAndSetQuotes', function () {
      it('returns null if fetchParams is not provided', async function () {
        const quotes = await swapsController.fetchAndSetQuotes(undefined)
        assert.strictEqual(quotes, null)
      })

      it('calls fetchTradesInfo with the given fetchParams and returns the correct quotes', async function () {
        fetchTradesInfoStub.resolves(MOCK_QUOTES)

        // Make it so approval is not required
        sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(1))

        const [newQuotes] = await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        assert.deepStrictEqual(newQuotes[TEST_AGG_ID], {
          ...MOCK_QUOTES[TEST_AGG_ID],
          sourceTokenInfo: undefined,
          destinationTokenInfo: {
            symbol: 'FOO',
            decimals: 18,
          },
          isBestQuote: true,
          // TODO: find a way to calculate these values dynamically
          gasEstimate: 2000000,
          gasEstimateWithRefund: '8cd8e',
        })

        assert.strictEqual(
          fetchTradesInfoStub.calledOnceWithExactly(MOCK_FETCH_PARAMS),
          true,
        )
      })

      it('performs the allowance check', async function () {
        fetchTradesInfoStub.resolves(MOCK_QUOTES)

        // Make it so approval is not required
        const allowanceStub = sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(1))

        await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        assert.strictEqual(
          allowanceStub.calledOnceWithExactly(
            MOCK_FETCH_PARAMS.sourceToken,
            MOCK_FETCH_PARAMS.fromAddress,
          ),
          true,
        )
      })

      it('gets the gas limit if approval is required', async function () {
        fetchTradesInfoStub.resolves(MOCK_QUOTES)

        // Ensure approval is required
        sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(0))

        const timedoutGasReturnResult = { gasLimit: 1000000 }
        const timedoutGasReturnStub = sandbox
          .stub(swapsController, 'timedoutGasReturn')
          .resolves(timedoutGasReturnResult)

        await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        // Mocked quotes approvalNeeded is null, so it will only be called with the gas
        assert.strictEqual(
          timedoutGasReturnStub.calledOnceWithExactly({
            gas: DEFAULT_ERC20_APPROVE_GAS,
          }),
          true,
        )
      })

      it('marks the best quote', async function () {
        fetchTradesInfoStub.resolves(MOCK_QUOTES)

        // Make it so approval is not required
        sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(1))

        const [newQuotes, topAggId] = await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        assert.strictEqual(topAggId, TEST_AGG_ID)
        assert.strictEqual(newQuotes[topAggId].isBestQuote, true)
      })

      it('selects the best quote', async function () {
        const bestAggId = 'bestAggId'

        // Clone the existing mock quote and increase destination amount
        const bestQuote = {
          ...MOCK_QUOTES[TEST_AGG_ID],
          aggregator: bestAggId,
          destinationAmount: ethers.BigNumber.from(
            MOCK_QUOTES[TEST_AGG_ID].destinationAmount,
          )
            .add(1)
            .toString(),
        }
        const quotes = { ...MOCK_QUOTES, [bestAggId]: bestQuote }
        fetchTradesInfoStub.resolves(quotes)

        // Make it so approval is not required
        sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(1))

        const [newQuotes, topAggId] = await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        assert.strictEqual(topAggId, bestAggId)
        assert.strictEqual(newQuotes[topAggId].isBestQuote, true)
      })

      it('does not set isBestQuote if no conversion rate exists for destination token', async function () {
        fetchTradesInfoStub.resolves(MOCK_QUOTES)

        // Make it so approval is not required
        sandbox
          .stub(swapsController, '_getERC20Allowance')
          .resolves(ethers.BigNumber.from(1))

        swapsController.tokenRatesStore.updateState({
          contractExchangeRates: {},
        })
        const [newQuotes, topAggId] = await swapsController.fetchAndSetQuotes(
          MOCK_FETCH_PARAMS,
          MOCK_FETCH_METADATA,
        )

        assert.strictEqual(newQuotes[topAggId].isBestQuote, undefined)
      })
    })

    describe('resetSwapsState', function () {
      it('resets the swaps state correctly', function () {
        const { swapsState: old } = swapsController.store.getState()
        swapsController.resetSwapsState()
        const { swapsState } = swapsController.store.getState()
        assert.deepStrictEqual(swapsState, {
          ...EMPTY_INIT_STATE.swapsState,
          tokens: old.tokens,
        })
      })

      it('clears polling timeout', function () {
        swapsController.pollingTimeout = setTimeout(
          () => assert.fail(),
          1000000,
        )
        swapsController.resetSwapsState()
        assert.strictEqual(swapsController.pollingTimeout._idleTimeout, -1)
      })
    })

    describe('stopPollingForQuotes', function () {
      it('clears polling timeout', function () {
        swapsController.pollingTimeout = setTimeout(
          () => assert.fail(),
          1000000,
        )
        swapsController.stopPollingForQuotes()
        assert.strictEqual(swapsController.pollingTimeout._idleTimeout, -1)
      })

      it('resets quotes state correctly', function () {
        swapsController.stopPollingForQuotes()
        const { swapsState } = swapsController.store.getState()
        assert.deepStrictEqual(swapsState.quotes, {})
        assert.strictEqual(swapsState.quotesLastFetched, null)
      })
    })

    describe('resetPostFetchState', function () {
      it('clears polling timeout', function () {
        swapsController.pollingTimeout = setTimeout(
          () => assert.fail(),
          1000000,
        )
        swapsController.resetPostFetchState()
        assert.strictEqual(swapsController.pollingTimeout._idleTimeout, -1)
      })

      it('updates state correctly', function () {
        const tokens = 'test'
        const fetchParams = 'test'
        swapsController.store.updateState({
          swapsState: { tokens, fetchParams },
        })

        swapsController.resetPostFetchState()

        const { swapsState } = swapsController.store.getState()
        assert.deepStrictEqual(swapsState, {
          ...EMPTY_INIT_STATE.swapsState,
          tokens,
          fetchParams,
        })
      })
    })
  })
})
