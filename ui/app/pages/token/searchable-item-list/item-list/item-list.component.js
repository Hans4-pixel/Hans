import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Identicon from '../../../../components/ui/identicon'

export default function ItemList ({
  results = [],
  onClickItem = null,
  Placeholder = null,
  listTitle = '',
  maxListItems = 6,
  searchQuery = '',
  containerRef = null,
}) {
  console.log('results', results)
  return results.length === 0
    ? <Placeholder searchQuery={searchQuery} />
    : (
      <div className="searchable-item-list">
        {listTitle && (
          <div className="searchable-item-list__title">
            { listTitle }
          </div>
        )}
        <div className="searchable-item-list__list-container" ref={containerRef}>
          {
            results.slice(0, maxListItems)
              .map((result, i) => {
                const {
                  iconUrl,
                  identiconAddress,
                  selected,
                  disabled,
                  primaryLabel,
                  secondaryLabel,
                  rightPrimaryLabel,
                  rightSecondaryLabel,
                  IconComponent,
                } = result
                return (
                  <div
                    className={classnames('searchable-item-list__item', {
                      'searchable-item-list__item--selected': selected,
                      'searchable-item-list__item--disabled': disabled,
                    })}
                    onClick={() => onClickItem && onClickItem(result)}
                    key={`searchable-item-list-item-${i}`}
                  >
                    {iconUrl && (
                      <div
                        className="searchable-item-list__item-icon"
                        style={{ backgroundImage: iconUrl && `url(${iconUrl})` }}
                      />
                    )}
                    {identiconAddress && (
                      <Identicon
                        address={identiconAddress}
                        diameter={34}
                      />
                    )}
                    {IconComponent && <IconComponent />}
                    <div className="searchable-item-list__labels">
                      <div className="searchable-item-list__item-labels">
                        {primaryLabel && <span className="searchable-item-list__primary-label">{ primaryLabel }</span>}
                        {secondaryLabel && <span className="searchable-item-list__secondary-label">{ secondaryLabel }</span>}
                      </div>
                      {(rightPrimaryLabel || rightSecondaryLabel) && (
                        <div className="searchable-item-list__right-labels">
                          {rightPrimaryLabel && <span className="searchable-item-list__right-primary-label">{ rightPrimaryLabel }</span>}
                          {rightSecondaryLabel && <span className="searchable-item-list__right-secondary-label">{ rightSecondaryLabel }</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    )
}

ItemList.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    iconUrl: PropTypes.string,
    selected: PropTypes.bool,
    disabled: PropTypes.bool,
    primaryLabel: PropTypes.string,
    secondaryLabel: PropTypes.string,
    rightPrimaryLabel: PropTypes.string,
    rightSecondaryLabel: PropTypes.string,
  })),
  onClickItem: PropTypes.func,
  Placeholder: PropTypes.func,
  listTitle: PropTypes.string,
  maxListItems: PropTypes.number,
  searchQuery: PropTypes.string,
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(window.Element) }),
}
