import React, { Component } from 'react'
import { Switch, Route, matchPath } from 'react-router-dom'
import PropTypes from 'prop-types'
import h from 'react-hyperscript'
import classnames from 'classnames'
import NewAccountCreateForm from './new-account.container'
import NewAccountImportForm from './import-account'
import ConnectHardwareForm from './connect-hardware'
import {
  NEW_ACCOUNT_ROUTE,
  IMPORT_ACCOUNT_ROUTE,
  CONNECT_HARDWARE_ROUTE,
} from '../../helpers/constants/routes'

export default class CreateAccountPage extends Component {
  renderTabs () {
    const { history, location } = this.props
    const getClassNames = path => classnames('new-account__tabs__tab', {
      'new-account__tabs__selected': matchPath(location.pathname, {
        path,
        exact: true,
      }),
    })

    return (
      <div className="new-account__tabs">
        <div className={getClassNames(NEW_ACCOUNT_ROUTE)} onClick={() => history.push(NEW_ACCOUNT_ROUTE)}>{
          this.context.t('create')
        }</div>
        <div className={getClassNames(IMPORT_ACCOUNT_ROUTE)} onClick={() => history.push(IMPORT_ACCOUNT_ROUTE)}>{
          this.context.t('import')
        }</div>
        <div className={getClassNames(CONNECT_HARDWARE_ROUTE)} onClick={() => history.push(CONNECT_HARDWARE_ROUTE)}>{
          this.context.t('connect')
        }</div>
      </div>
    )
  }

  render () {
    return h('div.new-account', {}, [
      h('div.new-account__header', [
        h('div.new-account__title', this.context.t('newAccount')),
        this.renderTabs(),
      ]),
      h('div.new-account__form', [
        h(Switch, [
          h(Route, {
            exact: true,
            path: NEW_ACCOUNT_ROUTE,
            component: NewAccountCreateForm,
          }),
          h(Route, {
            exact: true,
            path: IMPORT_ACCOUNT_ROUTE,
            component: NewAccountImportForm,
          }),
          h(Route, {
            exact: true,
            path: CONNECT_HARDWARE_ROUTE,
            component: ConnectHardwareForm,
          }),
        ]),
      ]),
    ])
  }
}

CreateAccountPage.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
  t: PropTypes.func,
}

CreateAccountPage.contextTypes = {
  t: PropTypes.func,
}
