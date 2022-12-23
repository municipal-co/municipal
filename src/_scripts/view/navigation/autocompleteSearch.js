import React, { useEffect, useState, useRef } from "react";
import sdkClient from "../../lib/findifyApi";
import ProductCard from "../global/productCard";
import { getBreakpointMinWidth } from "../../core/breakpoints";
import swiper from "swiper";
import NavigationSearch from "./search";

const AutocompleteSearch = (props) => {
  const searchContainer = useRef();
  const [data, setData] = useState({
    recommendations: [],
    items: [],
  })

  const getRecommendations = async () => {
    return await sdkClient.send({
      type: 'autocomplete',
      params: {
        q: props.searchQuery || '',
        limits: {
          items: 6,
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
      recommendations: result.suggestions,
      items: result.items
    })
  }

  const updateContainerOffset = () => {
    const breakpointMinWidth = getBreakpointMinWidth('md');
    setTimeout(() => {
      if(window.innerWidth < breakpointMinWidth) {
        // mobile
        if(props.searchFormContainer.current) {
          const topSpacing = props.searchFormContainer.current.offsetHeight + props.searchFormContainer.current.getBoundingClientRect().top;
          searchContainer.current.style.top = `${topSpacing + 15}px`;
          searchContainer.current.style.height = `calc(100% - ${topSpacing + 15}px)`
        }
      } else {
        // desktop
        if(props.navigationContainer.current) {
          searchContainer.current.style.top = `${props.navigationContainer.current.style.top}`;
          searchContainer.current.style.height = `calc(100% - ${props.navigationContainer.current.style.top}`
        }
      }
    }, 400);

  }

  const initRecommendationsSlider = () => {
    new swiper(recommendationSlider.current,
      {
        slidesPerView: "auto",
        spaceBetween: 10,
        threshold: 10,
        watchOverflow: true,
        observeParents: true,
        observer: true,
        slidesOffsetAfter: 30,
        slidesOffsetBefore: 30,
    })
  }

  const recommendationSlider = useRef()
  useEffect(() => {
    document.addEventListener('breakpointChange', updateContainerOffset);

    return (() => {
      document.removeEventListener('breakpointChange', updateContainerOffset);
    })
  }, [])

  useEffect(() => {
    fetchData();
    initRecommendationsSlider();
  }, [props.searchQuery])

  useEffect(() => {
    updateContainerOffset();
  }, [props.navigationContainer.current, props.searchFormContainer.current, props.searchActive])

  useEffect(() => {
    searchContainer.current.scrollTo({
      top: 0
    })
  }, [props.searchActive])

  return (
    <div className={`autocomplete-container ${props.searchActive ? 'is-open' : ''}`} ref={searchContainer}>
      <div className="autocomplete__mobile-header">
        <div className="autocomplete__title">Search</div>
        <div className="autocomplete__close-button">
          <div className="autocomplete__close" ref={searchContainer} onClick={() => { props.setSearchActive(false)}}>
            <div className="sr-only">Close Autocomplete</div>
            <div className="icon-close"></div>
          </div>
        </div>
      </div>
      <NavigationSearch
        searchActive={props.searchActive}
        setSearchActive={props.setSearchActive}
        setSearchQuery={props.setSearchQuery}
      />
      <div className="autocomplete__recommendations">
        <h3 className="autocomplete__heading">
          {props.searchQuery == '' ?
            "Trending Searches" : "Search Suggestions"
          }
        </h3>
        <div className="autocomplete__slider swiper-container" ref={recommendationSlider}>
          <ul className="autocomplete__recommended-queries swiper-wrapper">
            {data.recommendations.map((recommendation) => {
              return (<li key={recommendation.value} className="swiper-slide">
                <a href={`/search/?q=${recommendation.value}`} className="autocomplete__recommended-query"> {recommendation.value} </a>
              </li>)
            })}
          </ul>
        </div>
      </div>

      <div className="autocomplete__results">
        <h3 className="autocomplete__heading">
          {props.searchQuery == '' ?
            "Trending Products" : "Product Matches"
          }

        </h3>
        <ul className="autocomplete__grid content-grid content-grid--1-col content-grid--md-2-col content-grid--lg-1-col">
          {data.items.map((product) => {
              return (<li key={product.id} className="content-grid__item">
                {<ProductCard
                data={product}/>}
              </li>)
            })
          }
        </ul>
      </div>
    </div>
  )
}

export default AutocompleteSearch;