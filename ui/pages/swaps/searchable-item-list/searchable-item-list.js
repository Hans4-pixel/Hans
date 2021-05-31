import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import ItemList from './item-list';
import ListItemSearch from './list-item-search';

export default function SearchableItemList({
  className,
  defaultToAll,
  fuseSearchKeys,
  itemSelectorError,
  itemsToSearch = [],
  listTitle,
  maxListItems,
  onClickItem,
  Placeholder,
  searchPlaceholderText,
  hideRightLabels,
  hideItemIf,
  listContainerClassName,
}) {
  const itemListRef = useRef();

  const [results, setResults] = useState(defaultToAll ? itemsToSearch : []);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={className}>
      <ListItemSearch
        listToSearch={itemsToSearch}
        fuseSearchKeys={fuseSearchKeys}
        onSearch={({
          searchQuery: newSearchQuery = '',
          results: newResults = [],
        }) => {
          setSearchQuery(newSearchQuery);
          setResults(newResults);
        }}
        error={itemSelectorError}
        searchPlaceholderText={searchPlaceholderText}
        defaultToAll={defaultToAll}
        listContainerClassName={listContainerClassName}
      />
      <ItemList
        searchQuery={searchQuery}
        results={results}
        onClickItem={onClickItem}
        Placeholder={Placeholder}
        listTitle={listTitle}
        maxListItems={maxListItems}
        containerRef={itemListRef}
        hideRightLabels={hideRightLabels}
        hideItemIf={hideItemIf}
        listContainerClassName={listContainerClassName}
      />
    </div>
  );
}

SearchableItemList.propTypes = {
  itemSelectorError: PropTypes.string,
  itemsToSearch: PropTypes.array,
  onClickItem: PropTypes.func,
  Placeholder: PropTypes.func,
  className: PropTypes.string,
  searchPlaceholderText: PropTypes.string,
  fuseSearchKeys: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      weight: PropTypes.number,
    }),
  ),
  listTitle: PropTypes.string,
  defaultToAll: PropTypes.bool,
  maxListItems: PropTypes.number,
  hideRightLabels: PropTypes.bool,
  hideItemIf: PropTypes.func,
  listContainerClassName: PropTypes.string,
};
