import React, {useEffect, useRef, useState, forwardRef} from 'preact/compat'
import Close from '../icons/Close'
import { Swiper, SwiperSlide} from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import LookCard from './LookCard';

const ShopTheLookDrawer = forwardRef(({ data, index }) => {
  const drawer = useRef();
  const [productData, setProductData] = useState();

  const productList = data.map((productItem) => {
    return `handle:${productItem.product_handle}`;
  });

  const colorList = data;

  const closeDrawer = () => {
    const event = new CustomEvent('drawerClose');
    drawer.current.classList.remove('is-visible');
    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }
    drawer.current.addEventListener('transitionend', () => {
      document.dispatchEvent(event);
    });
  };

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;

    if (index === eventIndex) {
      closeDrawer();
    }
  };

  const fetchProductData = async () => {
    const productListParam = productList.join('+OR+');
    const productsData = await fetch(
      `/search/?q=${productListParam}&view=json&type=product`,
      { method: 'get' }
    ).then((response) => {
      return response.json();
    });

    productsData.sort((a, b) => {
      const firstIndex = productList.findIndex((item) => {
        return a.handle == item.replace('handle:', '');
      })

      const secondIndex = productList.findIndex((item) => {
        return b.handle == item.replace('handle:', '');
      })

      return firstIndex - secondIndex;
    })

    return productsData;
  };

  const buildProductData = async () => {
    const productsData = await fetchProductData();

    productsData.forEach((product, index) => {
      const colorIndex = product.options.findIndex((option) => {
        return option == 'Color' || option == 'color';
      });
      if (colorIndex > -1) {
        product.colorIndex = `option${colorIndex + 1}`;
        product.variants = product.variants.filter((variant) => {
          const colorData = colorList.find((item) => {
            return item.product_handle == product.handle;
          });
          return variant[product.colorIndex] == colorData.selected_color;
        });

        product.variants.map(variant => {
          variant.options = product.options;
        })

        product.selected_color = product.variants[0][product.colorIndex];
      }
    });

    setProductData(productsData);
  };

  const buildDrawerProducts = () => {
    return productData.map((product) => {
      return (
        <SwiperSlide>
          <LookCard product={product} />
        </SwiperSlide>
      );
    });
  };

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    buildProductData();
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div className="drawer look-drawer" ref={drawer} key={`modal-${index}`}>
      <div className="drawer__inner">
        <div className="drawer__header look-drawer__header">
          <div className="drawer__header-title look-drawer__header-title">
            Shop This Look
          </div>
          <button className="drawer__close icon-close" onClick={closeDrawer}>
            <Close />
            <div className="sr-only">Close Look Drawer</div>
          </button>
        </div>
        {productData && (
          <div className="drawer__body-contents look-drawer__body">
            <div className="slider-container">
              <Swiper
                modules={[Navigation]}
                centeredSlides
                loop={false}
                slidesPerView={1.5}
                spaceBetween={15}
                threshold={20}
                navigation={{
                  prevEl: '[data-arrow-prev]',
                  nextEl:'[data-arrow-next]',
                }}>
                {buildDrawerProducts()}
              </Swiper>
              <div
                className="look-drawer__arrow look-drawer__arrow--prev"
                data-arrow-prev
              ></div>
              <div
                className="look-drawer__arrow look-drawer__arrow--next"
                data-arrow-next
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ShopTheLookDrawer;
