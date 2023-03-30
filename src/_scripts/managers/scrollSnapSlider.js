import { colorIsBright } from '../core/utils';

export default class ScrollSnapSlider {
  constructor(container, settings) {
    this.settings = {
      initialSlide: settings.initialSlide || 0,
      disableScrollbar: settings.disableScrollbar || false,
      slidesPerView: settings.slidesPerView || 3.5,
      breakpoints: settings.breakpoints,
      paddingBefore: settings.paddingBefore || 0,
      paddingAfter: settings.paddingAfter || 0,
    }

    this.selectors = {
      slider: settings.sliderWrapper || '[data-slider-container]',
      slide: settings.slide || '[data-slide]',
      nextArrow: settings.nextArrow || null,
      prevArrow: settings.prevArrow || null,
    }

    this.classes = {
      visible: settings.visibleClass || 'is-visible',
      dark: 'dark-bg',
      light: 'light-bg',
      sliderClass: 'snap-slider-wrapper',
      slideClass: 'snap-slider-slide',
    }

    if(!container) {
      console.error('[ScrollSnapSlider] - container is required for this to work');
      return;
    }
    this.container = container;
    this.slider = container.querySelector(this.selectors.slider);

    if(!this.slider) {
      console.error(`[ScrollSnapSlider] - ${this.selectors.slider} was not found`);
    }

    this.slideList =  Array.from(this.slider.children);

    if(settings.enableArrows){
      this.buildArrows.call(this);
    }

    this.Observer = new IntersectionObserver(this.observerCallback.bind(this), {
      root: this.slider,
      threshold: 0.99,
    })
    this.mediaQueries = [];

    if(this.settings.breakpoints) {
      // eslint-disable-next-line no-restricted-syntax
      for(const [key, value] of Object.entries(this.settings.breakpoints)) {
        this.mediaQueries.push({
          query: window.matchMedia(`(min-width: ${key}px)`),
          settings: value
        })
      }
    }

    this.initSlider();
    this.initSlides();
    this.breakpointCallback();

    this.slideList.forEach(slide => {
      this.Observer.observe(slide);
    })

    this.mediaQueries.forEach(queryObject => {
      queryObject.query.addEventListener('change', this.breakpointCallback.bind(this));
    })

    this.goToSlide.call(this, this.settings.initialSlide);
  }

  initSlider() {
    const bgColor = window.getComputedStyle(this.container).backgroundColor;
    this.slider.classList.add(this.classes.sliderClass);
    this.container.classList.add(colorIsBright(bgColor) ? this.classes.dark : this.classes.light);
    if(this.settings.disableScrollbar === true) {
      this.slider.classList.add('noScrollBar');
    }
  }

  initSlides() {
    this.slideList.forEach(slide => {
      slide.classList.add(this.classes.slideClass);
    })
  }

  observerCallback(entries) {
    entries.forEach((entry, index) => {
      if(entry.isIntersecting) {
        entry.target.classList.add(this.classes.visible);
      } else {
        entry.target.classList.remove(this.classes.visible);
      }
    })

    if(this.slideList[0].className.indexOf('is-visible') > -1 && this.arrowPrev) {
      this.arrowPrev.disabled = true;
    } else {
      this.arrowPrev.disabled = false;
    }

    if(this.slideList[this.slideList.length - 1].className.indexOf('is-visible') > -1 && this.arrowNext) {
      this.arrowNext.disabled = true;
    } else {
      this.arrowNext.disabled = false;
    }
  }

  buildArrows() {
    if(typeof(this.selectors.prevArrow) !== 'string') {
      const newNode = document.createElement('button');
      newNode.innerText = 'previous';
      this.arrowPrev = this.slider.parentNode.insertBefore(newNode, this.slider);
      this.arrowPrev.type = 'button';
      this.arrowPrev.addEventListener('click', this.navigateToPrevSlide.bind(this));
    } else {
      this.arrowPrev = this.slider.parentNode.querySelector(this.selectors.prevArrow);
      this.arrowPrev.addEventListener('click', this.navigateToPrevSlide.bind(this))
    }
    if(typeof(this.selectors.nextArrow) !== 'string') {
      const newNode = document.createElement('button');
      newNode.innerText = 'next';
      this.arrowNext = this.slider.parentNode.insertBefore(newNode, this.slider);
      this.arrowNext.type = 'button';
      this.arrowNext.addEventListener('click', this.navigateToNextSlide.bind(this));
    } else {
      this.arrowNext = this.slider.parentNode.querySelector(this.selectors.nextArrow);
      this.arrowNext.addEventListener('click', this.navigateToNextSlide.bind(this))
    }
  }

  navigateToNextSlide() {
    const firstActiveSlide = this.slideList.find(slide => {
      return slide.classList.contains(this.classes.visible)
    });
    const slideIndex = this.slideList.indexOf(firstActiveSlide);

    if(slideIndex < this.slideList.length - 1) {
      const cardCoordinate = this.slideList[slideIndex + 1].offsetLeft - Number.parseInt(window.getComputedStyle(this.slider).scrollPadding.replace('0px ', '').replace('px', '') * 2);
      this.slider.scrollTo({
        left: cardCoordinate,
        behavior: 'smooth'
      })
    }
  }

  navigateToPrevSlide() {
    const firstActiveSlide = this.slideList.find(item => {
      return item.classList.contains(this.classes.visible)
    })

    const slideIndex = this.slideList.indexOf(firstActiveSlide);
    if(slideIndex > 0) {
      const firstInactiveSlide = this.slideList[slideIndex - 1];
      const cardCoordinate = firstInactiveSlide.offsetLeft - Number.parseInt(window.getComputedStyle(this.slider).scrollPadding.replace('0px ', '').replace('px', '') * 2);
      this.slider.scrollTo({
        left: cardCoordinate,
        behavior: 'smooth'
      })
    }
  }

  goToSlide(index) {
    const selectedSlide = this.slideList[index];

    if(index > this.slideList.length || index < 0) {
      console.error('[Scroll Snap Slider] - The slide index is out of bounds');
      return
    }

    const cardCoordinate = selectedSlide.offsetLeft - (Number.parseInt(window.getComputedStyle(this.slider).scrollPadding.replace('0px ', '').replace('px', '') * 2))

    this.slider.scrollTo({
      left: cardCoordinate,
      behavior: 'smooth'
    })
  }

  breakpointCallback() {
    const lastBreakpoint = this.mediaQueries.findLast(mediaQuery => {
      return mediaQuery.query.matches
    })

    this.slider.style.setProperty('--paddingBefore', this.settings.paddingBefore);
    this.slider.style.setProperty('--paddingAfter', this.settings.paddingAfter);
    this.slider.style.setProperty('--slideWidth', Number.isNaN(this.settings.slidesPerView) ? this.settings.slidesPerView : 100/this.settings.slidesPerView + '%');

    if(lastBreakpoint) {
      if(lastBreakpoint.settings.paddingBefore) {
        this.slider.style.setProperty('--paddingBefore', lastBreakpoint.settings.paddingBefore)
      }
      if(lastBreakpoint.settings.paddingAfter) {
        this.slider.style.setProperty('--paddingAfter', lastBreakpoint.settings.paddingAfter)
      }
      if(lastBreakpoint.settings.slidesPerView) {
        this.slider.style.setProperty('--slideWidth', Number.isNaN(lastBreakpoint.settings.slidesPerView) ? lastBreakpoint.settings.slidesPerView : 100/lastBreakpoint.settings.slidesPerView + '%')
      }
    }
  }
}
