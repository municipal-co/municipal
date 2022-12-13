import React, { useEffect, useRef } from "react";
import ProductCard from "../global/productCard";
import PromoCard from "../global/promoCard";
import FindifyPagination from "./findifyPagination";

const ProductGrid = ((props) => {

  const buildItemList = () => {
    const items = props.collectionItems.items.map(product => {
      product.type = 'product';

      return product;
    });

    props.collectionItems.promos.forEach(promo => {
      promo.cards[0].type = 'promo';
      items.splice(promo.position - 1, 0, promo.cards[0])
    })

    return items;
  }

  const checkScrollIntoView = (item) => {
    return document.location.hash.indexOf(item.id) > -1
  }

  const buildItemsUI = () => {
    const itemList = buildItemList();

    const items = itemList.map(item => {
      const scrollIntoView = checkScrollIntoView(item);
      if(item.type == 'product') {
        return (<div key={item.id} className="content-grid__item"><ProductCard  data={item} scrollIntoView={scrollIntoView}/></div>)
      } else {
        return (<div key={item.id} className="content-grid__item"><PromoCard  data={item} /></div>)
      }
    })

    return items;
  }

  return (
    <div className={`collection__grid ${props.filtersOpen ? 'col-lg-16 col-xl-18' : 'col-24'}`}>
      <div className={`row content-grid content-grid--1-col content-grid--sm-1-col content-grid--md-2-col ${props.filtersOpen ? 'content-grid--lg-2-col content-grid--xl-3-col' : 'content-grid--lg-3-col content-grid--xl-4-col'}`}>
        { buildItemsUI() }
      </div>

      <FindifyPagination
          key="findify_pagination"
          currentPage={props.currentPage}
          itemsPerPage={props.itemsPerPage}
          itemCount={props.itemCount}
          setRequestParams={props.setRequestParams}
        />
    </div>
  )
})

export default ProductGrid;