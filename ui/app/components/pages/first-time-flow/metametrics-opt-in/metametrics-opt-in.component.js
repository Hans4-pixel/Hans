import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PageContainerFooter from '../../../page-container/page-container-footer'

export default class MetaMetricsOptIn extends Component {
  static propTypes = {
    history: PropTypes.object,
    setParticipateInMetaMetrics: PropTypes.func,
    nextRoute: PropTypes.string,
    firstTimeSelectionMetaMetricsName: PropTypes.string,
  }

  static contextTypes = {
    metricsEvent: PropTypes.func,
  }

  render () {
    const { metricsEvent } = this.context
    const {
      nextRoute,
      history,
      setParticipateInMetaMetrics,
      firstTimeSelectionMetaMetricsName,
    } = this.props

    return (
      <div className="metametrics-opt-in">
        <div className="metametrics-opt-in__main">
          <div className="app-header__logo-container">
            <img
              className="app-header__metafox-logo app-header__metafox-logo--horizontal"
              src="/images/logo/metamask-logo-horizontal.svg"
              height={30}
            />
            <img
              className="app-header__metafox-logo app-header__metafox-logo--icon"
              src="/images/logo/metamask-fox.svg"
              height={42}
              width={42}
            />
          </div>
          <div className="metametrics-opt-in__body-graphic">
            <img src="images/metrics-chart.svg" />
          </div>
          <div className="metametrics-opt-in__title">Help Us Improve MetaMask</div>
          <div className="metametrics-opt-in__body">
            <div className="metametrics-opt-in__description">
             MetaMask would like to gather some usage data to better understand how our users interact with the extension and inform futue development.
             This data will be used to continually improve the usability and user experience of our product. If you care about the usability of the ethereum
             ecosystem, please consider allowing these basic analytics.
            </div>
            <div className="metametrics-opt-in__description">
             MetaMask will..
            </div>

            <div className="metametrics-opt-in__committments">
              <div className="metametrics-opt-in__row">
                <i className="fa fa-check" />
                <div className="metametrics-opt-in__row-description">
                  Always allow you to opt-out via Settings
                </div>
              </div>
              <div className="metametrics-opt-in__row">
                <i className="fa fa-check" />
                <div className="metametrics-opt-in__row-description">
                  Send anonymized click & pageview events
                </div>
              </div>
              <div className="metametrics-opt-in__row">
                <i className="fa fa-check" />
                <div className="metametrics-opt-in__row-description">
                  Maintain a public aggregate dashboard to educate the community
                </div>
              </div>
              <div className="metametrics-opt-in__row metametrics-opt-in__break-row">
                <i className="fa fa-times" />
                <div className="metametrics-opt-in__row-description">
                  <span className="metametrics-opt-in__bold">Never</span> collect keys, addresses, transactions, balances, hashes, or any personal information
                </div>
              </div>
              <div className="metametrics-opt-in__row">
                <i className="fa fa-times" />
                <div className="metametrics-opt-in__row-description">
                  <span className="metametrics-opt-in__bold">Never</span> collect your full IP address
                </div>
              </div>
              <div className="metametrics-opt-in__row">
                <i className="fa fa-times" />
                <div className="metametrics-opt-in__row-description">
                  <span className="metametrics-opt-in__bold">Never</span> sell data for profit. Ever!
                </div>
              </div>
            </div>
          </div>
          <div className="metametrics-opt-in__footer">
            <PageContainerFooter
              onCancel={() => {
                setParticipateInMetaMetrics(false)
                  .then(() => {
                    metricsEvent({
                      eventOpts: {
                        category: 'MetaMetricsOptIn',
                        action: 'userSelectsOption',
                        name: 'userOptedOut',
                      },
                      isOptIn: true,
                    }, {
                      excludeMetaMetricsId: true,
                    })
                    history.push(nextRoute)
                  })
              }}
              cancelText={'No Thanks'}
              hideCancel={false}
              onSubmit={() => {
                setParticipateInMetaMetrics(true)
                  .then(([participateStatus, metaMetricsId]) => {
                    return metricsEvent({
                      eventOpts: {
                        category: 'MetaMetricsOptIn',
                        action: 'userSelectsOption',
                        name: 'userOptedIn',
                      },
                      isOptIn: true,
                    })
                    .then(() => {
                      return metricsEvent({
                        eventOpts: {
                          category: 'Onboarding',
                          action: 'importOrCreate',
                          name: firstTimeSelectionMetaMetricsName,
                        },
                        isOptIn: true,
                        metaMetricsId,
                      })
                    })
                    .then(() => {
                      history.push(nextRoute)
                    })
                  })
              }}
              submitText={'I agree'}
              submitButtonType={'confirm'}
              disabled={false}
            />
            <div className="metametrics-opt-in__bottom-text">
              This data is aggregated and is therefore anonymous for the purposes of General Data Protection Regulation (EU) 2016/679. For more information in relation to our privacy practices, please see our Privacy Policy here.
            </div>
          </div>
        </div>
      </div>
    )
  }
}
