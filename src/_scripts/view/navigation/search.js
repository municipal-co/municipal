import React from "react";
const NavigationSearch = (props) => {

  const searchParams = new URLSearchParams(document.location.search);
  const updateQueryString = (evt) => {
    props.setSearchQuery(evt.target.value);
  }

  return(
    <form action="/search" method="get" autoComplete="off" target="_self" className="navigation-search">
      <div className="icon-search" aria-hidden></div>
      <input type="search" name="q" placeholder="Search" onFocus={() => {props.setSearchActive(true)}} onKeyUp={updateQueryString} defaultValue={searchParams.get('q')} className="navigation-search__input"/>
      <button type="submit" className="navigation-search__submit-btn"> Search </button>
    </form>
  )
}

export default NavigationSearch;