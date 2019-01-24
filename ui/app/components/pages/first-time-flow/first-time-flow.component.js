import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import FirstTimeFlowSwitch from './first-time-flow-switch'
import Welcome from './welcome'
import Unlock from '../unlock-page'
import CreatePassword from './create-password'
import Notices from './notices'
import SeedPhrase from './seed-phrase'
import {
  DEFAULT_ROUTE,
  INITIALIZE_WELCOME_ROUTE,
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_NOTICE_ROUTE,
  INITIALIZE_SEED_PHRASE_ROUTE,
  INITIALIZE_UNLOCK_ROUTE,
} from '../../../routes'

export default class FirstTimeFlow extends PureComponent {
  static propTypes = {
    completedOnboarding: PropTypes.bool,
    createNewAccount: PropTypes.func,
    createNewAccountFromSeed: PropTypes.func,
    history: PropTypes.object,
    isInitialized: PropTypes.bool,
    isUnlocked: PropTypes.bool,
    noActiveNotices: PropTypes.bool,
    unlockAccount: PropTypes.func,
  }

  state = {
    seedPhrase: '',
    isImportedKeyring: false,
  }

  componentDidMount () {
    const { completedOnboarding, history, isInitialized, isUnlocked } = this.props

    if (completedOnboarding) {
      history.push(DEFAULT_ROUTE)
      return
    }

    if (isInitialized && !isUnlocked) {
      history.push(INITIALIZE_UNLOCK_ROUTE)
      return
    }
  }

  handleCreateNewAccount = async password => {
    const { createNewAccount } = this.props

    try {
      const seedPhrase = await createNewAccount(password)
      this.setState({ seedPhrase })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  handleImportWithSeedPhrase = async (password, seedPhrase) => {
    const { createNewAccountFromSeed } = this.props

    try {
      await createNewAccountFromSeed(password, seedPhrase)
      this.setState({ isImportedKeyring: true })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  handleUnlock = async password => {
    const { unlockAccount, history, noActiveNotices } = this.props

    try {
      const seedPhrase = await unlockAccount(password)
      this.setState({ seedPhrase }, () => {
        noActiveNotices
          ? history.push(INITIALIZE_SEED_PHRASE_ROUTE)
          : history.push(INITIALIZE_NOTICE_ROUTE)
      })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  render () {
    const { seedPhrase, isImportedKeyring } = this.state

    return (
      <div className="first-time-flow">
        <Switch>
          <Route
            path={INITIALIZE_SEED_PHRASE_ROUTE}
            render={props => (
              <SeedPhrase
                { ...props }
                seedPhrase={seedPhrase}
              />
            )}
          />
          <Route
            exact
            path={INITIALIZE_NOTICE_ROUTE}
            render={props => (
              <Notices
                { ...props }
                isImportedKeyring={isImportedKeyring}
              />
            )}
          />
          <Route
            path={INITIALIZE_CREATE_PASSWORD_ROUTE}
            render={props => (
              <CreatePassword
                { ...props }
                onCreateNewAccount={this.handleCreateNewAccount}
                onCreateNewAccountFromSeed={this.handleImportWithSeedPhrase}
              />
            )}
          />
          <Route
            path={INITIALIZE_UNLOCK_ROUTE}
            render={props => (
              <Unlock
                { ...props }
                onSubmit={this.handleUnlock}
              />
            )}
          />
          <Route
            exact
            path={INITIALIZE_WELCOME_ROUTE}
            component={Welcome}
          />
          <Route
            exact
            path="*"
            component={FirstTimeFlowSwitch}
          />
        </Switch>
      </div>
    )
  }
}
