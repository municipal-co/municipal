import React, { useEffect, useState } from "react";
import { buildUrlSearchParams } from "./utils";

const FindifyPagination = ((props) => {

  const buildPages = () => Math.ceil(props.itemCount / props.itemsPerPage);

  const updatePage = (page) => {
    props.setRequestParams((requestParams) => {
      const newParams = {
        ...requestParams,
        page: page
      }

      history.pushState(newParams, null, document.location.pathname.replace('/collections/', '') + '?' + buildUrlSearchParams(newParams).toString())

      return newParams
    })
  }

  const buildPaginationItems = () => {
    const paginationItems = [];
    let startPage = 1;
    let endPage = pageMax;
    let showPrevSpacer = false;
    let showNextSpacer = false;

    if(props.currentPage > 3) {
      showPrevSpacer = true;
      startPage = props.currentPage - 1;
    }

    if(props.currentPage < (pageMax - 2)) {
      showNextSpacer = true;
      endPage = parseInt(props.currentPage) + 1;
    }

    paginationItems.push(
      <button key="pagination-previous" className={`pagination-item ${props.currentPage == 1 ? 'disabled' : ''}`} onClick={() => {updatePage(props.currentPage - 1)}} disabled={props.currentPage == 1}>
        Previous
      </button>
    )

    if(showPrevSpacer) {
      paginationItems.push(<button key="pagination-1" className="pagination-item" onClick={() => updatePage(1)}>
        <span className="sr-only">Go to page</span>
        1
      </button>)
      paginationItems.push(<div key="previousSpacer" className="pagination-item">
        <span>...</span>
      </div>)
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <button key={`pagination-${i}`} className={`pagination-item ${props.currentPage == i ? 'pagination-item--current' : ''}`} onClick={() => {updatePage(i)}}>
          <span aria-hidden>{i}</span>
          <span className="sr-only">Go to page {i}</span>
        </button>
      )
    }

    if(showNextSpacer) {
      paginationItems.push(<div key="nextSpacer" className="pagination-item">
        <span>...</span>
      </div>)
      paginationItems.push(<button key={`pagination-${pageMax}`} className={`pagination-item ${props.currentPage == pageMax ? 'disabled' : ''}`} onClick={() => updatePage(pageMax)} disabled={props.currentPage == pageMax}>
        <span className="sr-only">Go to page</span>
        {pageMax}
      </button>)
    }

    paginationItems.push(
      <button key="pagination-next" className={`pagination-item`} onClick={() => {updatePage(props.currentPage + 1)}} disabled={props.currentPage == pageMax}>
        Next
      </button>
    )

    return paginationItems;
  }

  const pageMax = buildPages();

  if(pageMax > 1) {
      return (
        <div className="findify-pagination">
          {buildPaginationItems()}
        </div>
      )
  } else {
    return null;
  }

})

export default FindifyPagination