import React, { useEffect, useRef, useState } from "react";
import { processName, buildUrlSearchParams } from "./utils";

const FindifyFilters = ((props) => {
  let newFilters = props.currentFilters;
  const [filterList, setFilterList] = useState([]);

  const updateFilters = (evt) => {
    if(props.isLoading) {
      return;
    }

    const $this = evt.target;
    const type = $this.dataset.type;
    const name = $this.name;
    const value = type == 'text' ? $this.value : buildFilterValue($this.value, type);
    const isChecked = evt.target.checked;
    const currentFilter = newFilters.find(filter => filter.name == name);
    const currentFilterIndex = newFilters.indexOf(currentFilter);

    if(isChecked) {
      // Need to add the filter to the list
      if(currentFilter) {
        newFilters[currentFilterIndex].values.push(type == 'range' ? { from: value.from, to: value.to } : { value })
      } else {
        // Filter doesn't have this type just yet, adding new filter
        newFilters.push({
          type,
          name,
          values: [
            type == 'range' ? { from: value.from, to: value.to } : { value }
          ]
        })
      }
    } else {
      const currentValue = currentFilter.values.find((obj) => obj.value == value);
      const currentValueIndex = currentFilter.values.indexOf(currentValue);
      newFilters[currentFilterIndex].values.splice(currentValueIndex, 1);
    }



    props.setRequestParams((requestParams) => {
      const newParams = {
        ...requestParams,
        filters: newFilters,
        page: 1,
      }

      history.pushState(newParams, null, document.location.pathname.replace('/collections/', '') + '?' + buildUrlSearchParams(newParams).toString())
      return newParams;
    })
  }

  const buildFilterValue = (value, type = 'range') => {
    if(type == 'range') {
      const underscorePosition = value.indexOf('_');
      const valuePieces = value.split('_');

      switch(underscorePosition){
        case 0:
          return {to: valuePieces[1]}
        case value.length - 1:
          return {from: valuePieces[0]}
        default:
          return {from: valuePieces[0], to: valuePieces[1]}
      }
    }
  }

  const addCustomPriceRange = (evt) => {
    const $this = evt.target;
    const name = $this.name;
    const from = priceMin.current.value || undefined;
    const to = priceMax.current.value || undefined;

    const currentFilter = newFilters.find(filter => filter.name == name);
    const currentFilterIndex = newFilters.indexOf(currentFilter);

    if(currentFilter) {
      newFilters[currentFilterIndex].values.push({
        from,
        to
      })
    } else {
      newFilters.push({
        name,
        type: 'range',
        values: [{
          from,
          to
        }]
      })
    }

    props.setRequestParams((requestParams) => {
      const newParams = {
        ...requestParams,
        filters: newFilters,
        page: 1
      }

      history.pushState(newParams, null, document.location.pathname.replace('/collections/', '') + '?' + buildUrlSearchParams(newParams).toString())

      return newParams;
    })
  }

  const toggleFilter = (evt) => {
    const $this = evt.currentTarget;
    const filterName = $this.dataset.filterName;

    const currentFilter = filterList.find((filter) => {
      return filter.name == filterName
    })

    const filterIndex = filterList.indexOf(currentFilter);

    setFilterList((filterList) => {
      filterList[filterIndex].isOpen = !filterList[filterIndex].isOpen;
      return [...filterList];
    })
  }

  const buildFiltersDom = () => {
    const filterDom = filterList.map(filter => {
      return (
        <div key={filter.name} className={`filter ${filter.isOpen == true ? 'is-open' : ''}`}>
          <div className="filter__header">
            <h6 className="filter__title">
              {filter.name.replace('custom_fields.', '')}
            </h6>
            <button className="filter__toggle" onClick={toggleFilter} data-filter-name={filter.name}>
              <span className="sr-only">{`${filter.isOpen ? 'Close' : 'Open' } Filter Group`}</span>
              <span className="filter__toggle-icon-container"></span>
            </button>
          </div>
          <div className="filter__body">
            { filter.values.map((value) => {
              return (<label key={value.value} className="filter__option">
                <input type="checkbox" name={value.name} value={value.value} data-type={filter.type} onChange={updateFilters} checked={value.selected || false}/>
                <span className="filter__checkbox-ui"></span>
                <span className="filter__label">{ filter.type == 'range' ? processName( value.value ) : value.value }</span>
                <div className="filter__count">({value.count})</div>
              </label>)
            })}
            {filter.type == 'range' &&
              <div className="filter__price-range">
                <div className="filter__input" >
                  <span className="filter__input-symbol">$</span>
                  <input type="number" ref={priceMin}/>
                </div>
                <span className="filter__divider">-</span>
                <div className="filter__input" >
                  <span className="filter__input-symbol">$</span>
                  <input type="number" ref={priceMax}/>
                </div>
                <button className="filter__input-button" name={filter.name} onClick={addCustomPriceRange}>Go</button>
              </div>
            }
          </div>
        </div>
      )
    })

    return filterDom;
  }

  const priceMax = useRef();
  const priceMin = useRef();

  useEffect(()=> {
    setFilterList(props.filters);
  }, [props.filters])

  return (
    <>
      <div className={`findify__filters ${props.filtersOpen ? "is-open" : ''} col-lg-8 col-xl-6`}>
        <div className="findify__filters-mobile-header">
          <h4 className="findify__filters-mobile-title">Filters</h4>
          <button className="findify__filters-close-button" onClick={props.toggleFilter}>
            <div className="findify__filter-icon-close">
              <span className="sr-only">Close Filters</span>
            </div>
          </button>
        </div>
        {buildFiltersDom()}
        <div className="findify__filters-apply-btn-container">
          <button className="findify__filters-apply-btn btn btn--primary btn-block" onClick={props.toggleFilter}>
            See results
            <span className="icon-arrow"></span>
          </button>
        </div>
      </div>
      <div className="findify__filters-backdrop" onClick={props.toggleFilter}></div>
    </>
  )
})

export default FindifyFilters;