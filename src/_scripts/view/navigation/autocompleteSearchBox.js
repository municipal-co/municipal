import React, { useEffect, useRef } from "react";
import { client } from "../../lib/findifyApi";
import Search  from "../../icons/Search";
import Clear from "../../icons/Clear";

const AutocompleteSearchBox = (props) => {
  const inputField = useRef();
  const updateQueryString = (evt) => {
    props.setSearchQuery(evt.target.value);
  }

  const triggerRedirect = (e) => {
    if(props.data.redirect && props.data.redirect !== "") {
      e.preventDefault();
      e.stopPropagation();
      client.sendEvent('redirect', {
        rid: props.data.rid,
        name: props.data.redirect.name,
        url: props.data.redirect.url,
        suggestion: props.data.query
      })
      document.location.href = props.data.redirect.url;
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

  return (
    <form
      action="/search"
      method="get"
      autoComplete="off"
      target="_self"
      className="autocomplete-search__form relative max-w-full w-full lg:w-[384px] mx-auto px-[20px] lg:px-0 mb-10"
      onSubmit={triggerRedirect}
    >
      <input
        type="text"
        name="q"
        placeholder="What are you looking for?"
        onChange={updateQueryString}
        className={`autocomplete-search__input bg-core-gray-1 w-full text-center rounded-full border-core-gray-1 px-16 py-3.5 appearance-none placeholder-black`}
        ref={inputField}
      />

      <button
        type="submit"
        className="autocomplete-search__submit absolute left-10 lg:left-5 top-1/2 -translate-y-1/2"
        onClick={triggerRedirect}
      >
        <Search className="w-6 h-6" />
        <div className="sr-only">Search</div>
      </button>
      <button
        type="reset"
        className="autocomplete-search__reset absolute right-10 lg:right-5 top-1/2 -translate-y-1/2"
        onClick={() => {
          inputField.current.focus();
        }}
      >
        <Clear className="w-6 h-6" />
        <div className="sr-only">Clear search</div>
      </button>
    </form>
  );
}

export default AutocompleteSearchBox;
