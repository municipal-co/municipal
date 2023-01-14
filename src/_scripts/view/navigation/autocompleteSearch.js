import React, { useEffect, useState, useRef } from "react";
import sdkClient from "../../lib/findifyApi";
import ProductCard from "../global/productCard";
import { Swiper, SwiperSlide } from "swiper/react"
import AutocompleteSearchBox from "./autocompleteSearchBox";

const AutocompleteSearch = (props) => {
  const searchContainer = useRef();
  const recommendationSlider = useRef()
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    recommendations: [],
    items: [],
  })

  const openSearchDrawer = () => {
    setIsOpen(true);
  }

  const closeSearchDrawer = (evt) => {
    if(evt && evt.detail && evt.detail.target == 'search') {
      return;
    }
    setIsOpen(false);
  }

  const getRecommendations = async () => {
    return await sdkClient.send({
      type: 'autocomplete',
      params: {
        q: searchQuery,
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

  useEffect(() => {
    document.addEventListener('drawer:search-open', openSearchDrawer);
    document.addEventListener('drawer:open-header-drawer', closeSearchDrawer)
    return (() => {
      document.removeEventListener('drawer:search-open', openSearchDrawer);
      document.removeEventListener('drawer:open-header-drawer', closeSearchDrawer)
    })
  }, [])


  useEffect(() => {
    fetchData();
  }, [searchQuery])

  useEffect(() => {
    const action = isOpen ? 'add' : 'remove';
    const body = document.querySelector('body');

    searchContainer.current.scrollTo({
      top: 0
    })

    if(body) {
      body.classList[action]('drawer-open');
    }
  }, [isOpen])

  return (
    <>
    <div className={`autocomplete-container ${isOpen ? 'is-open' : ''}`} ref={searchContainer}>
      <div className="autocomplete__header">
        <div className="autocomplete__title">Search</div>
        <div className="autocomplete__close-button">
          <div className="autocomplete__close" ref={searchContainer} onClick={() => {setIsOpen(false)}}>
            <div className="sr-only">Close Autocomplete</div>
            <div className="icon-close"></div>
          </div>
        </div>
      </div>
      <AutocompleteSearchBox
        searchActive={isOpen}
        setSearchQuery={setSearchQuery}
      />
      {data.items.length > 0 ?
        <>
          <div className="autocomplete__recommendations">
            <h3 className="autocomplete__heading">
              {searchQuery == '' ?
                "Trending Searches" : "Search Suggestions"
              }
            </h3>
            <div className="autocomplete__slider swiper swiper-container">
              <Swiper
                tag="ul"
                slidesPerView="auto"
                spaceBetween={10}
                threshold={10}
                slidesOffsetAfter={30}
                slidesOffsetBefore={30}
                watchOverflow={true}
                className="autocomplete__recommended-queries"
              >
              {data.recommendations.map((recommendation) => {
                  return (<SwiperSlide key={recommendation.value} tag="li">
                    <a href={`/search/?q=${recommendation.value}`} className="autocomplete__recommended-query"> {recommendation.value} </a>
                  </SwiperSlide>)
                })}
              </Swiper>
            </div>
          </div>
          <div className="autocomplete__results">
            <h3 className="autocomplete__heading">
              {searchQuery == '' ?
                "Trending Products" : "Product Matches"
              }

            </h3>
            <ul className="autocomplete__grid content-grid content-grid--1-col content-grid--md-2-col">
              {data.items.map((product) => {
                  return (<li key={product.id} className="content-grid__item">
                    {<ProductCard
                    data={product}/>}
                  </li>)
                })
              }
            </ul>
            {searchQuery !== '' &&
            <a href={`/search/?q=${searchQuery}`} className="cta cta--bottom-space">
              <span className="cta__label">
                See all results
              </span>
              <div className="cta__icon">
                <span className="cta__arrow-icon"></span>
              </div>
            </a>
            }
          </div>
        </>
      :
        <div className="autocomplete__no-results-text text-center">There were no results for the query "{searchQuery}"</div>
      }


    </div>
    <div className={`autocomplete-backdrop ${isOpen ? 'is-open' : ''}`} onClick={() => {setIsOpen(false)}}></div>
    </>
  )
}

export default AutocompleteSearch;