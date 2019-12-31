import React from 'react'
import assert from 'assert'
import shallow from '../../../../../../lib/shallow-with-context'
import sinon from 'sinon'
import GasPriceButtonGroup from '../gas-price-button-group.component'

import ButtonGroup from '../../../../ui/button-group'

const mockGasPriceButtonGroupProps = {
  buttonDataLoading: false,
  className: 'gas-price-button-group',
  gasButtonInfo: [
    {
      feeInPrimaryCurrency: '$0.52',
      feeInSecondaryCurrency: '0.0048 CFX',
      timeEstimate: '~ 1 min 0 sec',
      priceInHexWei: '0xa1b2c3f',
    },
    {
      feeInPrimaryCurrency: '$0.39',
      feeInSecondaryCurrency: '0.004 CFX',
      timeEstimate: '~ 1 min 30 sec',
      priceInHexWei: '0xa1b2c39',
    },
    {
      feeInPrimaryCurrency: '$0.30',
      feeInSecondaryCurrency: '0.00354 CFX',
      timeEstimate: '~ 2 min 1 sec',
      priceInHexWei: '0xa1b2c30',
    },
  ],
  handleGasPriceSelection: sinon.spy(),
  noButtonActiveByDefault: true,
  defaultActiveButtonIndex: 2,
  showCheck: true,
}

const mockButtonPropsAndFlags = Object.assign(
  {},
  {
    className: mockGasPriceButtonGroupProps.className,
    handleGasPriceSelection:
      mockGasPriceButtonGroupProps.handleGasPriceSelection,
    showCheck: mockGasPriceButtonGroupProps.showCheck,
  }
)

sinon.spy(GasPriceButtonGroup.prototype, 'renderButton')
sinon.spy(GasPriceButtonGroup.prototype, 'renderButtonContent')

describe('GasPriceButtonGroup Component', function () {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<GasPriceButtonGroup {...mockGasPriceButtonGroupProps} />)
  })

  afterEach(() => {
    GasPriceButtonGroup.prototype.renderButton.resetHistory()
    GasPriceButtonGroup.prototype.renderButtonContent.resetHistory()
    mockGasPriceButtonGroupProps.handleGasPriceSelection.resetHistory()
  })

  describe('render', () => {
    it('should render a ButtonGroup', () => {
      assert(wrapper.is(ButtonGroup))
    })

    it('should render the correct props on the ButtonGroup', () => {
      const {
        className,
        defaultActiveButtonIndex,
        noButtonActiveByDefault,
      } = wrapper.props()
      assert.equal(className, 'gas-price-button-group')
      assert.equal(defaultActiveButtonIndex, 2)
      assert.equal(noButtonActiveByDefault, true)
    })

    function renderButtonArgsTest (i, mockButtonPropsAndFlags) {
      assert.deepEqual(
        GasPriceButtonGroup.prototype.renderButton.getCall(i).args,
        [
          Object.assign({}, mockGasPriceButtonGroupProps.gasButtonInfo[i]),
          mockButtonPropsAndFlags,
          i,
        ]
      )
    }

    it('should call this.renderButton 3 times, with the correct args', () => {
      assert.equal(GasPriceButtonGroup.prototype.renderButton.callCount, 3)
      renderButtonArgsTest(0, mockButtonPropsAndFlags)
      renderButtonArgsTest(1, mockButtonPropsAndFlags)
      renderButtonArgsTest(2, mockButtonPropsAndFlags)
    })

    it('should show loading if buttonDataLoading', () => {
      wrapper.setProps({ buttonDataLoading: true })
      assert(wrapper.is('div'))
      assert(wrapper.hasClass('gas-price-button-group__loading-container'))
      assert.equal(wrapper.text(), 'loading')
    })
  })

  describe('renderButton', () => {
    let wrappedRenderButtonResult

    beforeEach(() => {
      GasPriceButtonGroup.prototype.renderButtonContent.resetHistory()
      const renderButtonResult = GasPriceButtonGroup.prototype.renderButton(
        Object.assign({}, mockGasPriceButtonGroupProps.gasButtonInfo[0]),
        mockButtonPropsAndFlags
      )
      wrappedRenderButtonResult = shallow(renderButtonResult)
    })

    it('should render a button', () => {
      assert.equal(wrappedRenderButtonResult.type(), 'button')
    })

    it('should call the correct method when clicked', () => {
      assert.equal(
        mockGasPriceButtonGroupProps.handleGasPriceSelection.callCount,
        0
      )
      wrappedRenderButtonResult.props().onClick()
      assert.equal(
        mockGasPriceButtonGroupProps.handleGasPriceSelection.callCount,
        1
      )
      assert.deepEqual(
        mockGasPriceButtonGroupProps.handleGasPriceSelection.getCall(0).args,
        [mockGasPriceButtonGroupProps.gasButtonInfo[0].priceInHexWei]
      )
    })

    it('should call this.renderButtonContent with the correct args', () => {
      assert.equal(
        GasPriceButtonGroup.prototype.renderButtonContent.callCount,
        1
      )
      const {
        feeInPrimaryCurrency,
        feeInSecondaryCurrency,
        timeEstimate,
      } = mockGasPriceButtonGroupProps.gasButtonInfo[0]
      const { showCheck, className } = mockGasPriceButtonGroupProps
      assert.deepEqual(
        GasPriceButtonGroup.prototype.renderButtonContent.getCall(0).args,
        [
          {
            feeInPrimaryCurrency,
            feeInSecondaryCurrency,
            timeEstimate,
          },
          {
            showCheck,
            className,
          },
        ]
      )
    })
  })

  describe('renderButtonContent', () => {
    it('should render a label if passed a gasEstimateType', () => {
      const renderButtonContentResult = wrapper.instance().renderButtonContent(
        {
          gasEstimateType: 'SLOW',
        },
        {
          className: 'someClass',
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(
        wrappedRenderButtonContentResult.childAt(0).children().length,
        1
      )
      assert.equal(
        wrappedRenderButtonContentResult.find('.someClass__label').text(),
        'slow'
      )
    })

    it('should render a feeInPrimaryCurrency if passed a feeInPrimaryCurrency', () => {
      const renderButtonContentResult = GasPriceButtonGroup.prototype.renderButtonContent(
        {
          feeInPrimaryCurrency: 'mockFeeInPrimaryCurrency',
        },
        {
          className: 'someClass',
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(
        wrappedRenderButtonContentResult.childAt(0).children().length,
        1
      )
      assert.equal(
        wrappedRenderButtonContentResult
          .find('.someClass__primary-currency')
          .text(),
        'mockFeeInPrimaryCurrency'
      )
    })

    it('should render a feeInSecondaryCurrency if passed a feeInSecondaryCurrency', () => {
      const renderButtonContentResult = GasPriceButtonGroup.prototype.renderButtonContent(
        {
          feeInSecondaryCurrency: 'mockFeeInSecondaryCurrency',
        },
        {
          className: 'someClass',
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(
        wrappedRenderButtonContentResult.childAt(0).children().length,
        1
      )
      assert.equal(
        wrappedRenderButtonContentResult
          .find('.someClass__secondary-currency')
          .text(),
        'mockFeeInSecondaryCurrency'
      )
    })

    it('should render a timeEstimate if passed a timeEstimate', () => {
      const renderButtonContentResult = GasPriceButtonGroup.prototype.renderButtonContent(
        {
          timeEstimate: 'mockTimeEstimate',
        },
        {
          className: 'someClass',
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(
        wrappedRenderButtonContentResult.childAt(0).children().length,
        1
      )
      assert.equal(
        wrappedRenderButtonContentResult
          .find('.someClass__time-estimate')
          .text(),
        'mockTimeEstimate'
      )
    })

    it('should render a check if showCheck is true', () => {
      const renderButtonContentResult = GasPriceButtonGroup.prototype.renderButtonContent(
        {},
        {
          className: 'someClass',
          showCheck: true,
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(wrappedRenderButtonContentResult.find('.fa-check').length, 1)
    })

    it('should render all elements if all args passed', () => {
      const renderButtonContentResult = wrapper.instance().renderButtonContent(
        {
          gasEstimateType: 'SLOW',
          feeInPrimaryCurrency: 'mockFeeInPrimaryCurrency',
          feeInSecondaryCurrency: 'mockFeeInSecondaryCurrency',
          timeEstimate: 'mockTimeEstimate',
        },
        {
          className: 'someClass',
          showCheck: true,
        }
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(wrappedRenderButtonContentResult.children().length, 5)
    })

    it('should render no elements if all args passed', () => {
      const renderButtonContentResult = GasPriceButtonGroup.prototype.renderButtonContent(
        {},
        {}
      )
      const wrappedRenderButtonContentResult = shallow(
        renderButtonContentResult
      )
      assert.equal(wrappedRenderButtonContentResult.children().length, 0)
    })
  })
})
