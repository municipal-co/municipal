import React, { useEffect, useRef, useState} from "preact/compat";

export function SnapScrollSlider({className, children, settings, ref}) {
  const slider = useRef();
  const slides = useRef([]);

  const baseSettings = {
    enableScrollbar: false,
    enableArrows: false,
    prevArrow: null,
    nextArrow: null,
    paddingBefore: 0,
    paddingAfter: 0,
    centerMode: false,
    activeClassName: 'is-visible',
    ...settings,
  }

  const [internalSettings, setInternalSettings] = useState(baseSettings);
  const nextArrow = useRef();
  const prevArrow = useRef();
  let mediaQueries = [];

  if(internalSettings.breakpoints) {
    for (const [key, value] of Object.entries(internalSettings.breakpoints)) {
      mediaQueries.push({
        query: window.matchMedia(`(min-width: ${key}px`),
        settings: value
      })
    }
  }

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add(baseSettings.activeClassName);
      } else {
        entry.target.classList.remove(baseSettings.activeClassName);
      }
      if(internalSettings.enableArrows && prevArrow.current !== null) {
        if( slides.current[0].className.indexOf(baseSettings.activeClassName) > -1) {
          prevArrow.current.disabled = true;
        } else {
          prevArrow.current.disabled = false;
        }
      }
      if(internalSettings.enableArrows &&  nextArrow.current !== null) {
        if(slides.current[slides.current.length - 1].className.indexOf(baseSettings.activeClassName) > -1) {
          nextArrow.current.disabled = true;
        } else {
          nextArrow.current.disabled = false;
        }
      }
    });
  }

  const goToNextSlide = () => {
    const firstActiveSlide = slides.current.find(slide => {
      return slide.classList.contains(baseSettings.activeClassName)
    });
    const slideIndex = slides.current.indexOf(firstActiveSlide);
    if(slideIndex < slides.current.length - 1) {
      let cardCoordinate = 0
      if(baseSettings.centerMode) {
        cardCoordinate = slides.current[slideIndex + 1].offsetLeft + (slides.current[slideIndex + 1].clientWidth / 2) - (slider.current.clientWidth / 2);
      } else {
        cardCoordinate = slides.current[slideIndex + 1].offsetLeft - Number.parseInt(window.getComputedStyle(slider.current).scrollPadding.replace('0px ', '').replace('px', '') * 2);
      }
      slider.current.scrollTo({
        left: cardCoordinate,
        behavior: 'smooth',
      });
    }
  }

  const goToPrevSlide = () => {
    const firstActiveSlide = slides.current.find(item => {
      return item.classList.contains(baseSettings.activeClassName)
    })

    const slideIndex = slides.current.indexOf(firstActiveSlide);
    if(slideIndex > 0) {
      let cardCoordinate;
      const firstInactiveSlide = slides.current[slideIndex - 1];
      if(baseSettings.centerMode) {
        cardCoordinate = firstInactiveSlide.offsetLeft + (firstInactiveSlide.clientWidth / 2) - (slider.current.clientWidth / 2);
      } else {
        cardCoordinate = firstInactiveSlide.offsetLeft - Number.parseInt(window.getComputedStyle(slider.current).scrollPadding.replace('0px ', '').replace('px', '') * 2);
      }

      slider.current.scrollTo({
        left: cardCoordinate,
        behavior: 'smooth'
      })
    }
  }

  const breakpointCallback = () => {
    const lastBreakpoint = mediaQueries.findLast(mediaQuery => {
      return mediaQuery.query.matches
    })
    setInternalSettings((oldSettings) => {
      if(lastBreakpoint) {
        return {
          ...oldSettings,
          ...lastBreakpoint.settings
        }
      } else {
        return {
          ...oldSettings,
          ...baseSettings
        }
      }
    })
  }

  useEffect(() => {
    slides.current = Array.from(slider.current.children);
    nextArrow.current = slider.current.parentNode.querySelector(internalSettings.nextArrow);
    prevArrow.current = slider.current.parentNode.querySelector(internalSettings.prevArrow);

    const Observer = new IntersectionObserver(observerCallback, {
      threshold: 0.9,
      root: slider.current
    })

    slides.current.forEach(slide => {
      Observer.observe(slide);
    })

    if(internalSettings.enableArrows) {
      if(prevArrow.current) {
        prevArrow.current.addEventListener('click', goToPrevSlide);
      }

      if(nextArrow.current) {
        nextArrow.current.addEventListener('click', goToNextSlide);
      }
    }

    mediaQueries.forEach(queryObject => {
      queryObject.query.addEventListener('change', breakpointCallback);
    })

    breakpointCallback();

    return () => {
      if(internalSettings.enableArrows) {
        if(prevArrow.current) {
          prevArrow.current.removeEventListener('click', goToPrevSlide);
        }

        if(nextArrow.current) {
          nextArrow.current.removeEventListener('click', goToNextSlide);
        }
      }
      slides.current.forEach(slide => {
        Observer.unobserve(slide);
      })
      mediaQueries.forEach(queryObject => {
        queryObject.query.removeEventListener('change', breakpointCallback);
      })
    }
  }, [])

  return(
    <>
      {(internalSettings.enableArrows && !prevArrow && !nextArrow &&
        <>
          <button className={`snap-slider-arrow prev-arrow`} onClick={goToNextSlide} ref={prevArrow}>
            <div className="sr-only">Go to prev slide</div>
          </button>
          <button className={`snap-slider-arrow next-arrow`} onClick={goToPrevSlide} ref={nextArrow}>
            <div className="sr-only">Go to next slide</div>
          </button>
        </>
      )}
      <div className={`snap-slider-wrapper ${!internalSettings.enableScrollbar ? 'noScrollBar' : ''} ${className ? className : ''}`}
      style={{
        "--paddingBefore": internalSettings.paddingBefore,
        "--paddingAfter": internalSettings.paddingAfter,
        "--slideWidth": isNaN(internalSettings.slidesPerView) ? internalSettings.slidesPerView : 100/internalSettings.slidesPerView + '%',
        "--slideAlignment": internalSettings.centerMode ? 'center' : 'start',
      }}
      ref={slider}>
        {children}
      </div>
    </>
  )
}

export function SnapScrollSlide({className = "", children}) {
  return (
    <div className={`snap-slider-slide ${className}`}>
      {children}
    </div>
  )
}