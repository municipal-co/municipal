import React, { useEffect, useRef } from "react";
const AutocompleteSearchBox = (props) => {
  const inputField = useRef();
  const updateQueryString = (evt) => {
    props.setSearchQuery(evt.target.value);
  }

  const triggerRedirect = (e) => {
    if(props.data.redirect && props.data.redirect !== "") {
      e.preventDefault();
      e.stopPropagation();
      document.location.href = props.data.redirect;
    }
  }

  useEffect(() => {
    if(props.searchActive === false) {
      props.setSearchQuery('');
      inputField.current.value = '';
    } else {
      inputField.current.focus();
    };
  }, [props.searchActive])

  return(
    <form action="/search" method="get" autoComplete="off" target="_self" className="autocomplete-search" onSubmit={triggerRedirect}>
      <div className="icon-search" aria-hidden></div>
      <input type="search" name="q" placeholder="What are you looking for?" onChange={updateQueryString} className={`autocomplete-search__input ${props.searchActive ? 'is-active' : ''}`} ref={inputField}/>
      <button type="submit" className="autocomplete-search__submit-btn" onClick={triggerRedirect}> Search </button>
    </form>
  )
}

export default AutocompleteSearchBox;
