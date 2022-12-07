import React, { useEffect, useRef, useState } from 'react';
import sdkClient from '../lib/findifyApi';
import FindifyFilters from '../view/findify/findifyFilters';
import FindifyHeader from '../view/findify/findifyHeader';
import ProductGrid from '../view/findify/productGrid';

const Collection = ((props) => {
  const getURLSort = () => {
    let sortData = [];
    const queryParams = new URLSearchParams(document.location.search);
    if(queryParams.has('sort')){
      sortData = queryParams.get('sort').split(':');
    }

    return sortData;
  }

  const getUrlFilters = () => {
    const filterList = [];

    for(const [param, value] of urlParams.entries()) {
      if(param.indexOf('filter') > -1) {
        const valueList = value.split(',');
        // Text filters
        if(param.indexOf('price') == -1  ){
          console.log(param);
          filterList.push({
            name: `${param.indexOf('gender') > -1 ? 'custom_fields.Gender' : param.replace('filter-', '')}`,
            type: 'text',
            values: valueList.map(value => {
                return {value};
              })

          })
        } else {
          // Range filter
          const valueList = value.split(',');
          filterList.push({
            name: param.replace('filter-', ''),
            type: "range",
            values: valueList.map(value => {
              const underscorePosition = value.indexOf('_');
              const valuePieces = value.split('_');
              switch(underscorePosition) {
                case 0:
                  return {to: `${valuePieces[1]}`}
                case value.length -1 :
                  return {from: `${valuePieces[0]}`}
                default:
                  return {from: `${valuePieces[0]}`, to: `${valuePieces[1]}`}
              }
            })
          })
        }
      }
    }

    return filterList;
  }

  const requestCollectionData = async () => {
    return await sdkClient.send({
        type: 'smart-collection',
        params: {...requestParams,
        offset: calcOffset(itemCount, requestParams.page)
      },
      }).then(response => {
        return response;
      });
  }


  const calcOffset = (limit, page) => limit * (page - 1);

  const toggleFilter = () => {
    setFiltersOpen((isOpen) => {
    const action = !isOpen ? 'add' : 'remove';
    if(window.innerWidth <= 991) {
      document.querySelector('body').classList[action]('modal-open')
    }

    return !isOpen
    });
  }

  const updatePage = (page) => {
    const parameters = new URLSearchParams(document.location.search);
    parameters.set('page', page);
    history.pushState({property:'page', value: page}, null, document.location.pathname.replace('/collections/', '') + '?' + parameters.toString())
    setPage(page);
  }

  const urlParams = new URLSearchParams(document.location.search);
  const activeFilters = useRef([]);
  const itemCount = window.collectionLimit;
  const collectionTotal = useRef(0);
  const [filters, setFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [collectionItems, setCollectionItems] = useState({items: [], promos:[]});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(urlParams.get('page') || 1);

  const [requestParams, setRequestParams] = useState({
    slot: document.location.pathname,
    limit: itemCount,
    offset: calcOffset(itemCount, urlParams.get('page') || 1),
    sort: [{field: getURLSort()[0] || "default", order:getURLSort()[1] || "default"}],
    filters: getUrlFilters(),
    page: urlParams.get('page') || 1
  })

  const fetchData = async () => {
    const result = await requestCollectionData();

    const filters = result.facets.map(filter => {
      filter.isOpen = true;
      return filter;
    })
    setCollectionItems({ items:result.items, promos: result.promoSpots });
    setFilters(filters);
    collectionTotal.current = result.meta.total;
    activeFilters.current = result.meta.filters;
    setIsLoading(false);
  }

  const managePopState = (state) => {
    setRequestParams(state)
  }

  useEffect(() => {
    history.replaceState(requestParams, null, document.location.href)
  },[])

  useEffect(() => {
    setIsLoading(true);
    fetchData();

    window.onpopstate = (evt) => {
      managePopState(evt.state)
    };
    return () =>{
      window.onpopstate = null;
    }
  }, [requestParams])

  return(
    <>
      <FindifyHeader
        key="collection_header"
        currentFilters={activeFilters.current}
        currentSort={requestParams.sort[0]}
        toggleFilter={toggleFilter}
        setRequestParams={setRequestParams}
        filtersOpen={filtersOpen}/>

      <div key="collection_body" className={`collection__body row ${isLoading ? 'is-loading' : ''}`}>
        <div key="spinner" className="collection__loading-container">
          <div className="collection__loading-spinner"></div>
        </div>

        <FindifyFilters
          key="collection_filters"
          setRequestParams={setRequestParams}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          currentFilters={activeFilters.current}
          filters={filters}
          filtersOpen={filtersOpen}
          toggleFilter={toggleFilter} />

        <ProductGrid
          key="collection_items"
          collectionItems={collectionItems}
          filtersOpen={filtersOpen}
          currentPage={requestParams.page}
          itemsPerPage={itemCount}
          itemCount={collectionTotal.current}
          setRequestParams={setRequestParams}
          />
      </div>
    </>
  )
})


export default Collection;
