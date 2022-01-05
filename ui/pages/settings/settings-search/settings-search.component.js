import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '../../../components/ui/text-field';
import { isEqualCaseInsensitive } from '../../../helpers/utils/util';
import SearchIcon from '../../../components/ui/icon/search-icon.component';

export default class SettingsSearch extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static defaultProps = {
    error: null,
  };

  static propTypes = {
    onSearch: PropTypes.func,
    error: PropTypes.string,
    settingsRoutesList: PropTypes.array,
  };

  state = {
    searchQuery: '',
    searchIconColor: '#9b9b9b',
  };

  constructor(props) {
    super(props);
    const { settingsRoutesList } = this.props;

    this.settingsRoutesList = Object.values(settingsRoutesList);
    this.settingsSearchFuse = new Fuse(this.settingsRoutesList, {
      shouldSort: true,
      threshold: 0.2,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['tab', 'section', 'description'],
    });
  }

  handleSearch(searchQuery) {
    this.setState({ searchQuery });
    if (searchQuery === '') {
      this.setState({ searchIconColor: '#9b9b9b' });
    } else {
      this.setState({ searchIconColor: '#24292E' });
    }
    const fuseSearchResult = this.settingsSearchFuse.search(searchQuery);
    const addressSearchResult = this.settingsRoutesList.filter((routes) => {
      return (
        routes.tab &&
        searchQuery &&
        isEqualCaseInsensitive(routes.tab, searchQuery)
      );
    });

    const results = [...addressSearchResult, ...fuseSearchResult];
    this.props.onSearch({ searchQuery, results });
  }

  renderStartAdornment() {
    const args = {
      color: this.state.searchIconColor,
    };

    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <SearchIcon {...args} />
      </InputAdornment>
    );
  }

  renderEndAdornment() {
    return (
      <>
        {this.state.searchQuery && (
          <InputAdornment
            className="imageclosectn"
            position="end"
            onClick={() => this.handleSearch('')}
            style={{ cursor: 'pointer' }}
          >
            <img
              className="imageclose"
              src="images/close-gray.svg"
              width="17"
              height="17"
              alt=""
            />
          </InputAdornment>
        )}
      </>
    );
  }

  render() {
    const { error } = this.props;
    const { searchQuery } = this.state;

    return (
      <TextField
        id="search-settings"
        placeholder={this.context.t('searchSettings')}
        type="text"
        value={searchQuery}
        onChange={(e) => this.handleSearch(e.target.value)}
        error={error}
        fullWidth
        autoFocus
        autoComplete="off"
        style={{ backgroundColor: '#fff' }}
        startAdornment={this.renderStartAdornment()}
        endAdornment={this.renderEndAdornment()}
      />
    );
  }
}
