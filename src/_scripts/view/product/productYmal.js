import React, { useMemo, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper";
import ProductCard from "../global/productCard";

export default function ProductYmal(props) {
  const productData = JSON.parse(document.getElementById('pdp-ymal-data').innerHTML);
  const productGender = productData.tags.find((tag) => {
    return tag.indexOf('Mens') > -1 || tag.indexOf('Womens') > -1;
  });

  const buildProductCards = async () => {
    const productData = await getProducts();
    const productSlides = productData.map((product, index) => {
      return (
        <SwiperSlide>
          <ProductCard key={`pdp-ymal-product-${product.id}`} product={product} />
        </SwiperSlide>
      )
    })

    setProductCards(productSlides);
  }

  const getProducts = async () => {
    let recommendationsData;
    let products = [];
    let filteredProducts = [];

    try {
      const response = await fetch(`${window.Shopify.routes.root}recommendations/products.json?product_id=${productData.productId}`)
      recommendationsData = await response.json();
    } catch (error) {
      console.error('Error pulling recommendations')
      console.error('Error: ', error);
    }

    if(recommendationsData?.products) {

      filteredProducts = recommendationsData.products.filter((product) => {
        let validProduct = true;
        let variants = [];
        if(product.tags.indexOf('findify-remove') > -1) {
          validProduct = false;
        }
        if(product.tags.indexOf('ymal-remove') > -1) {
          validProduct = false;
        }
        if(typeof productGender !== 'undefined') {
          if(product.tags.indexOf(productGender) === -1) {
            validProduct = false;
          }
        }
        if(validProduct){
          variants = product.variants.filter((variant) => {
            if(!variant.compare_at_price) {
              return true;
            } else {
              return !(variant.compare_at_price > variant.price)
            }
          });
        }
        if(variants.length === 0) {
          validProduct = false;
        }

        return validProduct;
      })
    }

    if(filteredProducts.length) {
      const productsHandles = [];
      for(let i = 0; i < filteredProducts.length; i++) {
        if (productsHandles.length === 3) {
          break;
        }

        productsHandles.push(`handle:${filteredProducts[i].handle}`);
      }

      try {
        const response = await fetch(`${window.Shopify.routes.root}search?q=${productsHandles.join('+OR+')}&view=json&type=products`)
        products = await response.json();
      } catch (error) {
        console.error('Couldn\'t fetch product JSON');
        console.error('Error: ', error);
      }
    }

    return products;
  }

  const [productCards, setProductCards] = useState([]);

  useMemo(() => {
    buildProductCards();
  }, [])

  return (
    productCards.length > 0 &&
    <section id="product-card-slider-product-bundles"
             class="card-slider card-slider--pdp"
             style={{
                backgroundColor: '#393d49',
                color: '#fff'
             }}>
      <div className="container-fluid">
        <div className="row">
          <div className="card-slider__heading">
            <div className="card-slider__info-container">
              <h2 class="card-slider__title h2">You will like these too</h2>
            </div>
          </div>
        </div>
        <Swiper
          modules={[Navigation, Scrollbar]}
          slidesPerView={1.2}
          className="row card-slider__slider"
          slidesOffsetBefore={30}
          slidesOffsetAfter={30}
          spaceBetween={20}
          threshold={10}
          scrollbar= {{
            horizontalClass: 'card-slider__scrollbar swiper-scrollbar-horizontal',
            draggable: true,
          }}
          navigation={{
            enabled: true,
            prevEl: '.card-slider__arrow--prev',
            nextEl: '.card-slider__arrow--next',
          }}
        >
          {productCards}
          <div className="card-slider__arrow card-slider__arrow--prev"></div>
          <div className="card-slider__arrow card-slider__arrow--next"></div>
        </Swiper>
      </div>
    </section>
  );
}