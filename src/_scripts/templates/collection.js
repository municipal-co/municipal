import React, { useEffect, useRef, useState } from 'react';
import { sdkClient } from '../lib/findifyApi';
import FindifyFilters from '../view/findify/findifyFilters';
import FindifyHeader from '../view/findify/findifyHeader';
import ProductGrid from '../view/findify/productGrid';
import { calcOffset, getUrlFilters, getURLSort } from '../view/findify/utils';

const Collection = ((props) => {
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

  const toggleFilter = () => {
    setFiltersOpen((isOpen) => {
    const action = !isOpen ? 'add' : 'remove';
    if(window.innerWidth <= 991) {
      document.querySelector('body').classList[action]('modal-open')
    }

    return !isOpen
    });
  }

  const urlParams = new URLSearchParams(document.location.search);
  const activeFilters = useRef([]);
  const itemCount = window.collectionLimit;
  const collectionTotal = useRef(0);
  const [filters, setFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [collectionItems, setCollectionItems] = useState({items: [], promos:[]});
  const [isLoading, setIsLoading] = useState(true);
  const [rid, setRid] = useState();
  const [requestParams, setRequestParams] = useState({
    slot: document.location.pathname,
    limit: itemCount,
    offset: calcOffset(itemCount, urlParams.get('page') || 1),
    sort: [{field: getURLSort()[0] || "default", order:getURLSort()[1] || "default"}],
    filters: getUrlFilters(),
    page: urlParams.get('page') || 1
  })
  const templateHeader = useRef();


  const fetchData = async () => {
    const result = await requestCollectionData();

    const filters = result.facets.map(filter => {
      filter.isOpen = true;
      return filter;
    })
    setCollectionItems({ items:result.items, promos: result.promoSpots });
    setFilters(filters);
    setRid(result.meta.rid);
    collectionTotal.current = result.meta.total;
    activeFilters.current = result.meta.filters;
    setIsLoading(false);
  }

  const managePopState = (state) => {
    setRequestParams(state)
  }

  useEffect(() => {
    history.replaceState(requestParams, null, document.location.href)
    history.scrollRestoration = 'manual';
  },[])

  useEffect(() => {
    setIsLoading(true);
    fetchData();


    if(templateHeader.current && window.scrollY > templateHeader.current.getBoundingClientRect().top + window.scrollY && !document.location.hash) {
      window.scrollTo({
        top: templateHeader.current.getBoundingClientRect().top + window.scrollY - 90,
        behavior: 'smooth'
      })
    }

    window.onpopstate = (evt) => {
      managePopState(evt.state)
    };

    return () =>{
      window.onpopstate = null;
    }
  }, [requestParams])

  return(
    <div ref={templateHeader}>
      <FindifyHeader
        key="collection_header"
        currentFilters={activeFilters.current}
        currentSort={requestParams.sort[0]}
        toggleFilter={toggleFilter}
        setRequestParams={setRequestParams}
        filtersOpen={filtersOpen}/>

      <div key="collection_body" className={`findify__body row ${isLoading ? 'is-loading' : ''}`}>
        <div key="spinner" className="findify__loading-container">
          <div className="findify__loading-spinner"></div>
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
          rid={rid}
          />
      </div>
    </div>
  )
})


export default Collection;
