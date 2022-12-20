import React, { useEffect, useState, useRef } from "react";
import sdkClient from "../../lib/findifyApi";
import ProductCard from "../global/productCard";
import { getBreakpointMinWidth } from "../../core/breakpoints";

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
    console.log(window.innerWidth < breakpointMinWidth);
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

  useEffect(() => {
    document.addEventListener('breakpointChange', updateContainerOffset);

    return (() => {
      document.removeEventListener('breakpointChange', updateContainerOffset);
    })
  }, [])

  useEffect(() => {
    fetchData();
  }, [props.searchQuery])

  useEffect(() => {
    updateContainerOffset();
  }, [props.navigationContainer.current, props.searchFormContainer.current, props.searchActive])

  return (
    <div className="autocomplete-container" ref={searchContainer} style={{"display": `${props.searchActive ? 'block' : 'none'}`}}>
      <button className="autocomplete__close" onClick={()=>{props.setSearchActive(false)}}>
        <div className="sr-only">Close Autocomplete Window</div>
        <div className="icon-close"></div>
      </button>
      <div className="autocomplete__recommendations">
        <h3 className="autocomplete__heading">
          {props.searchQuery == '' ?
            "Trending Searches" : "Search Suggestions"
          }
        </h3>
        <ul className="autocomplete__recommended-queries">
          {data.recommendations.map((recommendation) => {
            return (<li key={recommendation.value}>
              <a href={`/search/?q=${recommendation.value}`} className="category-capsule"> {recommendation.value} </a>
            </li>)
          })}
        </ul>
      </div>

      <div className="autocomplete__results">
        <h3 className="autocomplete__heading">
          {props.searchQuery == '' ?
            "Trending Products" : "Product Matches"
          }

        </h3>
        <ul className="autocomplete__grid content-grid content-grid--sm-1-col content-grid--md-1-col content-grid--lg-2-col content-grid--xl-3-col">
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