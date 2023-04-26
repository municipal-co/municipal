import React, { useRef, useEffect } from 'react';
import Close from '../icons/Close';
import {Swiper, SwiperSlide} from 'swiper/react';
import { Pagination, EffectFade } from 'swiper';

export default function SizeGuideDrawer({data, index}) {
  const drawer = useRef();
  const sliderPagination = useRef();
  const closeDrawer = () => {
    drawer.current.classList.remove('is-visible');

    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }

    drawer.current.addEventListener('transitionend', (evt) => {
      if(evt.target !== drawer.current) return false;
      const event = new CustomEvent('drawerClose', {detail:{origin: 'sizeDrawer'}});
      document.dispatchEvent(event);
    });
  };

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;
    if (index === eventIndex) {
      closeDrawer();
    }
  };

  const buildImages = () => {
    return data.images.map((image) => {
      return <SwiperSlide>
        <img className="fit-guide__gallery-image" alt="" src={`${image}&width=550`} />
      </SwiperSlide>
    })
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div class="drawer fit-guide__drawer col-lg-10" ref={drawer}>
      <div class="drawer__inner fit-guide__inner">
        <div class="drawer__header fit-guide__header">
          <div class="drawer__header-title fit-guide__header-title">
            Size Guide
          </div>
          <a
            href="javascript:void(0);"
            class="drawer__close fit-guide__close"
            onClick={closeDrawer}
          >
            <Close />
            <span class="sr-only">Close size guide</span>
          </a>
        </div>
        <div class="drawer__body-contents fit-guide__body">
          {data.images && (
            <div class="fit-guide__gallery-container">
              <Swiper
                modules={[EffectFade, Pagination]}
                effect='fade'
                fadeEffect={{
                  crossFade: true
                }}
                pagination={{
                  el: '.fit-guide__gallery-pagination',
                  clickable: true,
                }}
              >
                {buildImages()}
                <div
                  className="swiper-pagination fit-guide__gallery-pagination"
                  ref={sliderPagination}
                />
              </Swiper>
            </div>
          )}

          {data.modelDescription &&
            <div className='fit-guide__gallery-description-content'>
              {data.modelDescription}
            </div>
          }

          {data.sizeList.length && (
            <table class="fit-guide__table responsible-table table-striped">
              <thead>
                <th></th>
                <th>
                  <b>Chest</b>
                </th>
                <th>
                  <b>Waist</b>
                </th>
                <th>
                  <b>Height</b>
                </th>
              </thead>
              <tbody>
                {data.sizeList.map((row) => {
                  return (
                    <tr>
                      <td> {row.name} </td>
                      <td> {row.chestSize} </td>
                      <td> {row.waistSize} </td>
                      <td> {row.heightSize} </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {data.boxContent && (
            <div class="blink-box blink-box--dark">
              {data.boxTitle && (
                <h6 class="blink-box__title">{data.boxTitle}</h6>
              )}

              <div
                class="blink-box__content"
                dangerouslySetInnerHTML={{ __html: data.boxContent }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}