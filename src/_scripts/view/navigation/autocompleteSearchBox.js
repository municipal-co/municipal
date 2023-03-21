import React, { useEffect, useRef } from 'preact/compat';
const AutocompleteSearchBox = (props) => {
  const inputField = useRef();
  const updateQueryString = (evt) => {
    props.setSearchQuery(evt.target.value);
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
    <form action="/search" method="get" autoComplete="off" target="_self" className="autocomplete-search">
      <div className="icon-search" aria-hidden></div>
      <input type="search" name="q" placeholder="What are you looking for?" onChange={updateQueryString} className={`autocomplete-search__input ${props.searchActive ? 'is-active' : ''}`} ref={inputField}/>
      <button type="submit" className="autocomplete-search__submit-btn"> Search </button>
    </form>
  )
}

export default AutocompleteSearchBox;
