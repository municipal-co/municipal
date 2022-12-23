import React from "react";
import { buildUrlSearchParams, handleize } from "./utils";

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

  const onSortChange = (evt) => {
    const sortPieces = evt.target.value.split(':');
    const searchParams = new URLSearchParams(document.location.search);
    if(sortPieces[0] == 'default') {
      searchParams.delete('sort');
    } else{
      searchParams.set('sort', `${sortPieces[0]}:${sortPieces[1]}`);
    }

    props.setRequestParams((requestParams) => {
      const newParams = {
        ...requestParams,
        sort: [{field:sortPieces[0], order: sortPieces[1]}],
        page: 1,
      }
      history.pushState(newParams, null, document.location.pathname.replace('/collections/', '') + '?' + searchParams.toString())
      return newParams;
    })
  }

  const removeFilter = (evt) => {
    const $this = evt.currentTarget;
    const filterIndex = $this.dataset.filterIndex;
    let newFilters = props.currentFilters;

    const valueIndex = $this.dataset.valueIndex;
    newFilters[filterIndex].values.splice(valueIndex, 1);

    props.setRequestParams((requestParams) => {
      const newParams = { ...requestParams, filters: newFilters, page: 1};
      history.pushState(newParams, null, document.location.pathname.replace('/collections/', '') + '?' + buildUrlSearchParams(newParams).toString())
      return newParams;
    })
  }

  const buildFilterList = () => {
    let filters = [];
    props.currentFilters.map((filter, filterIndex) => {
      filter.values.forEach((val, valueIndex) => {
        let value;
        let handle;

        if(filter.type == 'range') {
          const fromValue = val.from != undefined ? '$' + val.from + (val.to != undefined ? ' - ' : '') : '';
          const toValue = (val.from != undefined ? '$': 'Up to $') + val.to;
          value = fromValue + toValue;
          handle = val.from && (val.from+'-') + val.to && val.to;
        } else {
          value = val.value;
          handle = handleize(val.value);
        }

        filters.push(
          <button key={`${filter.name}-${handle}`} className="findify-header__remove-filter" onClick={removeFilter} data-filter-name={filter.name} data-filter-index={filterIndex} data-value-index={valueIndex} data-values-count={filter.values.length}>
            {filter.name == 'color' &&
              <div className={`swatch swatch--${handle}`} aria-hidden>
              </div>
            }
            {filter.name !== 'color' &&
              <span className="filter-text">{ value }</span>
            }
            <span className="sr-only">Remove filter {filter.name} { value } </span>
            <div className="icon-close" aria-hidden></div>
          </button>
        )
      })
    })

    return filters;
  }

  const clearFilters = () => {
    props.setRequestParams((requestParams) => {
     return { ...requestParams,
        filters: []
      }
    })
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
          <button className="findify-header__clear-filters-btn" onClick={clearFilters}>
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
        <select name="sort_order" className="findify-header__sort-select" onChange={onSortChange} value={`${props.currentSort?.field}:${props.currentSort?.order}`}>
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

