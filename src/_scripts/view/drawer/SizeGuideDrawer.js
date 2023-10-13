import React, { useRef, useEffect } from 'react';
import Close from '../icons/Close';
import {Swiper, SwiperSlide} from 'swiper/react';
import { Pagination, EffectFade } from 'swiper';
import Image from '../global/image';

export default function SizeGuideDrawer({data, index}) {
  const drawer = useRef();
  const sliderPagination = useRef();
  const enableFootwearUpdates = data?.productTags?.find((tag) => tag === 'Footwear');
  const hasNameColumn = data?.sizeList?.find((row) => row.name);

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
        <Image className="fit-guide__gallery-image" alt="" src={image} sizes="(max-width: 992px) 100vw, 500px"/>
      </SwiperSlide>
    })
  }

  const buildTableHeader = () => {
    if(enableFootwearUpdates) {
      const tableHeader = [];

      for(let i = 1; i <= 3; i++) {
        if(i == 1 && hasNameColumn) {
          tableHeader.push(<th key={`table-header-0`}></th>)
        }
        const headerIndex = 'tableHeader' + i;
          if(data[headerIndex]) {
            tableHeader.push(<th key={`table-header-${i}`}>
            <b>{ data[headerIndex] }</b>
          </th>)
        }
      }

      return tableHeader
    } else {
      return (<>
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
      </>)
    }
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div className="drawer fit-guide__drawer col-lg-10" ref={drawer}>
      <div className="drawer__inner fit-guide__inner">
        <div className="drawer__header fit-guide__header">
          <div className="drawer__header-title fit-guide__header-title">
            Size Guide
          </div>
          <a
            href="javascript:void(0);"
            className="drawer__close fit-guide__close"
            onClick={closeDrawer}
          >
            <Close />
            <span className="sr-only">Close size guide</span>
          </a>
        </div>
        <div className="drawer__body-contents fit-guide__body">
          {data.images.length > 0 && (
            <div className="fit-guide__gallery-container">
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

          {data.sizeList.length > 0 && (
            <table className={`fit-guide__table responsible-table table-striped
            ${!hasNameColumn ? 'fit-guide__table--no-name' : 'fit-guide__table--with-name'}
            ${enableFootwearUpdates ? 'fit-guide__table--footwear' : ''}`}>
              <thead>
                {buildTableHeader()}
              </thead>
              <tbody>
                {data.sizeList.map((row) => {
                  return (
                    <tr>
                      {hasNameColumn &&
                        <td> <b>{row.name}</b> </td>
                      }
                      {row.chestSize &&
                        <td> {row.chestSize} </td>
                      }
                      {row.waistSize &&
                        <td> {row.waistSize} </td>
                      }
                      {row.heightSize &&
                        <td> {row.heightSize} </td>
                      }
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {data.boxContent && (
            <div className="blink-box blink-box--dark">
              {data.boxTitle && (
                <h6 className="blink-box__title">{data.boxTitle}</h6>
              )}

              <div
                className="blink-box__content"
                dangerouslySetInnerHTML={{ __html: data.boxContent }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}