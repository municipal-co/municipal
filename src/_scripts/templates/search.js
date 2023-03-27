import React, { useEffect, useRef, useState } from "react"
import sdkClient from "../lib/findifyApi";
import FindifyHeader from "../view/findify/findifyHeader";
import FindifyTotalCount from "../view/findify/findifyTotalCount";
import FindifyFilters from "../view/findify/findifyFilters";
import ProductGrid from "../view/findify/productGrid";
import { calcOffset, getUrlFilters, getURLSort } from "../view/findify/utils";

const Search = (props) => {
  const requestSearchData = async () => {
    return await sdkClient.send({
      type: 'search',
      params: {...requestParams,
        offset: calcOffset(searchLimit, requestParams.page)
      }
    })
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
  const pageTotal = useRef(0);
  const itemsLimit = window.searchLimit;
  const [isLoading, setIsLoading] = useState(true);
  const [resultItems, setResultItems] = useState({items:[], promos:[]});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState([]);
  const activeFilters = useRef([]);
  const templateHeader = useRef();

  const [requestParams, setRequestParams] = useState({
    q: urlParams.get('q') || '',
    limit: itemsLimit,
    offset: calcOffset(itemsLimit, urlParams.get('page') || 1),
    sort: [{field: getURLSort()[0] || "default", order: getURLSort()[1] || "default"}],
    filters: getUrlFilters(),
    page: urlParams.get('page') || 1
  })

  const fetchData = async () => {
    const result = await requestSearchData();

    if(result) {
      const filters = result.facets.map(filter => {
        filter.isOpen = true;
        return filter;
      })
      if(result.redirect) {
        document.location.href = result.redirect.url
      }
      setResultItems({ items: result.items, promos: result.promoSpots });
      setFilters(filters);
      pageTotal.current = result.meta.total;
      activeFilters.current = result.meta.filters;
      setIsLoading(false);
    }

  }

  const managePopState = (state) => {
    setRequestParams(state);
  }

  useEffect(() => {
    history.replaceState(requestParams, null, document.location.href);
    history.scrollRestoration = 'manual';
  }, [])

  useEffect(() => {
    setIsLoading(true);
    fetchData();

    if(templateHeader.current && window.scrollY > templateHeader.current.offsetTop && !document.location.hash) {
      window.scrollTo({
        top: templateHeader.current.offsetTop + 90,
        behavior: 'smooth'
      })
    }

    window.onpopstate = (evt) => {
      managePopState(evt.state);
    }

    return () =>{
      window.onpopstate = null;
    }
  }, [requestParams])

  return (
    <div ref={templateHeader}>
      <FindifyTotalCount
        count={pageTotal.current}
        query={urlParams.get('q')}
      />
      <FindifyHeader
        key="search_header"
        currentFilters={activeFilters.current}
        currentSort={requestParams.sort[0]}
        toggleFilter={toggleFilter}
        setRequestParams={setRequestParams}
        filtersOpen={filtersOpen}/>

      <div key="search_body" className={`findify__body row ${isLoading ? 'is-loading' : ''}`}>
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
          collectionItems={resultItems}
          filtersOpen={filtersOpen}
          currentPage={requestParams.page}
          itemsPerPage={searchLimit}
          itemCount={pageTotal.current}
          selectedProducts={document.location.hash}
          setRequestParams={setRequestParams}
          />
      </div>
    </div>
  )
}

export default Search