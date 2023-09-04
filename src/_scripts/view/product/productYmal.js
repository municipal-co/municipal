import React, { useMemo, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Scrollbar } from "swiper";
import ProductCard from "../global/productCard";

export default function ProductYmal(props) {
  const productData = JSON.parse(document.getElementById('pdp-ymal-data').innerHTML);

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
    const recommendationsData = await fetch(`${window.Shopify.routes.root}recommendations/products.json?product_id=${productData.productId}&limit=4`).then((response) => response.json());
    return recommendationsData.products;
  }

  const [productCards, setProductCards] = useState([]);

  useMemo(() => {
    buildProductCards();
  }, [])

  return (
    <section class="card-slider card-slider--pdp">
      <div className="container-fluid">
        <div className="row">
          <div className="card-slider__heading">
            <div className="card-slider__info-container">
              <h2 class="card-slider__title h2">You will need these too</h2>
            </div>
          </div>
        </div>
        <div className="row card-grid__slider">
          <Swiper
            modules={[Navigation, Scrollbar]}
            scrollbar={true}
          >
            { productCards }
          </Swiper>
        </div>
      </div>
    </section>
  );
}