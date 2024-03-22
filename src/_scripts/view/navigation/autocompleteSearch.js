import React, { useEffect, useState, useRef } from "react";
import {sdkClient, client} from "../../lib/findifyApi";
import TabFocus from "../../utils/TabFocus";
import ScrollLock from "../../utils/ScrollLock";
import ProductCard from "../findify/productCard";
import { Swiper, SwiperSlide } from "swiper/react"
import AutocompleteSearchBox from "./autocompleteSearchBox";
import ArrowLink from "../../icons/ArrowLink";
import Close from "../../icons/Close";

const AutocompleteSearch = (props) => {
  const searchContainer = useRef();
  const header = document.querySelector('header');
  const headerHeight = header.offsetHeight;
  const headerOffset = header.offsetTop;

  const recommendationSlider = useRef()
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [referrer, setReferrer] = useState(null);
  const [data, setData] = useState({
    rid: '',
    recommendations: [],
    items: [],
    redirect: ''
  })

  const toggleSearchDrawer = (evt) => {
    setReferrer(evt.detail.referrer);
    if(isOpen) {
      closeSearchDrawer();
    } else {
      openSearchDrawer();
    }
  }

  const openSearchDrawer = () => {
    setIsOpen(true);
  }

  const closeSearchDrawer = () => {
    setIsOpen(false);
  }

  const getRecommendations = async () => {
    return await sdkClient.send({
      type: 'autocomplete',
      params: {
        q: searchQuery,
        limits: {
          items: 4,
          suggestions: 6,
        }
      }
    }).then(response => {
      return response;
    })
  }

  const fetchData = async () => {
    const result = await getRecommendations();
    setData({
      query: result.meta.q,
      rid: result.meta.rid,
      recommendations: result.suggestions,
      items: result.items,
      redirect: result.redirect
    })
  }

  const trackSuggestionClick = (evt) => {
    const target = evt.target;
    const rid = target.dataset.rid;
    const suggestion = target.innerText;

    client.sendEvent('click-suggestion', {
      rid,
      suggestion,
    })

    client.sendEvent('redirect', {
      rid,
      suggestion
    })
  }

  const escListener = (evt) => {
    if(evt.key === 'Escape') {
      closeSearchDrawer();
    }
  }

  useEffect(() => {
    fetchData();
  }, [searchQuery])

  useEffect(() => {
    document.addEventListener('drawer:search-toggle', toggleSearchDrawer);
    searchContainer.current.addEventListener('keyup', escListener);
    const action = isOpen ? 'add' : 'remove';
    const header = document.getElementById('header');
    const searchToggler = document.querySelector('.header__search-toggler');

    searchContainer.current.scrollTo({
      top: 0
    })

    if(header) {
      header.classList[action]('drawer-open');
    }
    if(searchToggler) {
      searchToggler.classList[action]('before:!opacity-100');
    }

    return (() => {
      document.removeEventListener('drawer:search-toggle', toggleSearchDrawer);
      searchContainer.current.removeEventListener('keyup', escListener);
    })
  }, [isOpen])

  return (
    <>
      <div
        className={`autocomplete-container transition-all duration-300 ease-in-out bg-white w-full lg:pt-10 rounded-t-[20px] lg:rounded-t-none absolute t-0 !z-10 overflow-y-auto
    ${
      isOpen === true
        ? 'translate-y-0 opacity-[1]'
        : 'pointer-events-none opacity-0 -translate-y-[90px]'
    }`}
        ref={searchContainer}
        style={{
          'height': 'calc(100dvh - 80px)',
        }}
      >
        <div className="block lg:hidden text-right">
          <div className="relative">
            <button
              type="button"
              className="autocomplete__close px-4 pt-4"
              ref={searchContainer}
              onClick={() => {
                closeSearchDrawer(false);
              }}
            >
              <div className="sr-only">Close Autocomplete Search</div>
              <Close className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AutocompleteSearchBox
          searchActive={isOpen}
          setSearchQuery={setSearchQuery}
          data={data}
        />
        {data.items.length > 0 ? (
          <>
            <div className="autocomplete__recommendations w-full text-center my-[20px] md:my-10">
              <h3 className="autocomplete__heading text-h6 px-[20px]">
                {searchQuery == '' ? 'Popular Searches' : 'Search Suggestions'}
              </h3>
              <div className="autocomplete__slider">
                <Swiper
                  tag="ul"
                  slidesPerView="auto"
                  spaceBetween={10}
                  threshold={10}
                  slidesOffsetAfter={20}
                  slidesOffsetBefore={20}
                  watchOverflow={true}
                  centerInsufficientSlides={true}
                  className="autocomplete__recommended-queries"
                >
                  {data.recommendations.map((recommendation) => {
                    return (
                      <SwiperSlide
                        key={recommendation.value}
                        tag="li"
                        className="!w-max inline-block"
                      >
                        <a
                          href={`/search/?q=${recommendation.value}`}
                          className="autocomplete__recommended-query inline-block border-2 rounded-full px-4 py-1 border-black hover:bg-black hover:text-white transition-color duration-150 ease-in-out"
                          onClick={trackSuggestionClick}
                          data-rid={data.rid}
                        >
                          {recommendation.value}
                        </a>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
            <div className="autocomplete__results px-[20px]">
              <h3 className="autocomplete__heading text-center text-h6 mx-auto">
                {searchQuery == '' ? 'Trending Products' : 'Product Matches'}
              </h3>
              <ul className="autocomplete__grid max-w-layout mx-auto px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.items.map((product) => {
                  return (
                    <li key={product.id} className="block">
                      {<ProductCard data={product} rid={data.rid} />}
                    </li>
                  );
                })}
              </ul>
              {searchQuery !== '' && (
                <div className="text-center py-[20px]">
                  <a
                    href={`/search/?q=${searchQuery}`}
                    className="btn-v3"
                  >
                    See all results
                    <ArrowLink className="icon" />
                  </a>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="autocomplete__no-results-text text-center">
            There were no results for the query "{searchQuery}"
          </div>
        )}
      </div>
      { isOpen && (
        <>
          <TabFocus container={searchContainer.current} referrer={referrer} updateTriggers={data.items} />
          <ScrollLock />
        </>
      )}
      <div
        className={`autocomplete-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={() => {
          setIsOpen(false);
        }}
      ></div>
    </>
  );
}

export default AutocompleteSearch;
