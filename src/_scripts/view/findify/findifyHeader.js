import React from "react";

const FindifyHeader = ((props) => {

  const sortList = [
    {
      field: 'default',
      order: 'default',
      label: 'Popularity'
    },
    {
      field: 'price',
      order: 'desc',
      label: 'Price: High to Low'
    },
    {
      field:'price',
      order: 'asc',
      label: 'Price: Low to High'
    },
    {
      field: 'created_at',
      order: 'desc',
      label: 'What\'s new'
    }
  ]

  const buildActiveFilterCount = () => {
    let filtersCount = 0;
    props.currentFilters.forEach(filter => {
      filtersCount += filter.values.length
    })

    return filtersCount;
  }

  const handleize = (string) => {
    return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '')
  }

  const removeFilter = (evt) => {
    const $this = evt.currentTarget;
    const valueCount = $this.dataset.valuesCount;
    const filterIndex = $this.dataset.filterIndex;
    let newFilters = props.currentFilters;

    if(valueCount == 1) {
      newFilters.splice(filterIndex, 1);
    } else {
      const valueIndex = $this.dataset.valueIndex;
      newFilters[filterIndex].values.splice(valueIndex, 1);
    }

    props.setCurrentFilters(newFilters);
  }

  const buildFilterList = () => {
    let filters = [];
    props.currentFilters.map((filter, filterIndex) => {
      filter.values.forEach((val, valueIndex) => {
        filters.push(
          <button key={`${filter.name}-${val.value}`} className="findify-header__remove-filter" onClick={removeFilter} data-filter-name={filter.name} data-filter-index={filterIndex} data-value-index={valueIndex} data-values-count={filter.values.length}>
            {filter.name == 'color' &&
              <div className={`swatch swatch--${handleize(val.value)}`} aria-hidden>
              </div>
            }
            {filter.name !== 'color' &&
              <span className="filter-text">{val.value}</span>
            }
            <span className="sr-only">Remove filter {filter.name} {val.value}</span>
            <div className="icon-close" aria-hidden></div>
          </button>
        )
      })
    })

    return filters;
  }

  const activeFilterCount = buildActiveFilterCount();

  return (
    <div className="findify-header">
      <div className={`findify-header__filter-container ${props.filtersOpen? 'col-lg-8 col-xl-6' : ''}`}>
        <button className="findify-header__filter-toggle-btn" onClick={props.toggleFilter}>
          <div className="findify-header__filter-icon icon-filter"></div>
          <div className="findify-header__filter-title">Filters {activeFilterCount > 0 && <span className="findify-header__filter-count">({activeFilterCount})</span>}</div>
        </button>
        { props.filtersOpen && buildActiveFilterCount() > 0 &&
          <button className="findify-header__clear-filters-btn" onClick={() => {props.setCurrentFilters([])}}>
            (Clear all<span className="sr-only"> filters</span>)
          </button>
        }
        {
          props.filtersOpen &&
          <button className="findify-header__close-filters-btn" onClick={props.toggleFilter}>
            <span aria-hidden>Hide</span>
            <span className="sr-only">Close filters</span>
            <div className="icon-close"></div>
          </button>
        }
      </div>
      <div className="findify-header__filter-list">
        {buildFilterList()}
      </div>
      <div className="findify-header__sort-container">
        <span className="findify-header__sort-label">SORT BY:</span>
        <select name="sort_order" className="findify-header__sort-select" onChange={props.onSelectChange} value={`${props.currentSort?.field}:${props.currentSort?.order}`}>
          {
            sortList.map(filter => {
              return <option key={`${filter.field}:${filter.order}`} value={`${filter.field}:${filter.order}`}>{filter.label}</option>
            })
          }
        </select>
      </div>
    </div>
  )
})

export default FindifyHeader;

