import React, { useEffect, useRef, useState } from 'react';
import sdkClient from '../lib/findifyApi';
import FindifyFilters from '../view/findify/findifyFilters';
import FindifyHeader from '../view/findify/findifyHeader';
import ProductGrid from '../view/findify/productGrid';

const Collection = ((props) => {
  const activeFilters = useRef([]);
  const [filters, setFilters] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [collectionItems, setCollectionItems] = useState({items: [], promos:[]});
  // TODO: Refactor to get order from URL defaults to field:default, order:default;
  const [sort, setSort] = useState([{field: "default", order: "default"}]);
  const [page, setPage] = useState(1);
  const [pageTotal, setPageTotal] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState([]);


  const requestCollectionData = async (filters, sort, offset = 0) => {
    return await sdkClient.send({
      type: 'smart-collection',
      params: {
        slot: document.location.pathname,
        limit: 36,
        offset,
        sort,
        filters,
      },
    }).then(response => {
      return response;
    });
  }

  const onSelectChange = (evt) => {
    const sortPieces = evt.target.value.split(':');
    setIsLoading(true);
    setSort([{field: sortPieces[0], order:sortPieces[1]}]);
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

  useEffect(() => {
    async function fetchData () {
      const result = await requestCollectionData(currentFilters, sort);
      setCollectionItems({ items:result.items, promos: result.promoSpots });
      const filters = result.facets.map(filter => {
        filter.isOpen = true;
        return filter;
      })
      setFilters(result.facets);
      activeFilters.current = result.meta.filters;
      setIsLoading(false);
    }
    fetchData();
  }, [currentFilters, sort])

  return(
    <>
      <FindifyHeader key="collection_header" onSelectChange={onSelectChange} currentFilters={activeFilters.current} currentSort={sort[0]} toggleFilter={toggleFilter}/>
      <div key="collection_body" className={`collection__body row ${isLoading ? 'is-loading' : ''}`}>
        <div key="spinner" className="collection__loading-container">
          <div className="collection__loading-spinner"></div>
        </div>

        <FindifyFilters key="collection_filters" setCurrentFilters={setCurrentFilters} isLoading={isLoading} setIsLoading={setIsLoading} currentFilters={activeFilters.current} filters={filters} filtersOpen={filtersOpen} toggleFilter={toggleFilter} />
        <ProductGrid key="collection_items" collectionItems={collectionItems} filtersOpen={filtersOpen}/>
      </div>
    </>
  )
})


export default Collection;
