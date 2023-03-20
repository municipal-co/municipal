import { colorIsBright } from '../core/utils';

export default class ScrollSnapSlider {
  constructor(container, settings) {

    this.settings = {
      initialSlide: settings.initialSlide || 0,
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


    this.initSlider();
    this.initSlides();
    this.slideList.forEach(slide => {
      this.Observer.observe(slide);
    })

    this.goToSlide.call(this, this.settings.initialSlide);
  }

  initSlider() {
    const bgColor = window.getComputedStyle(this.container).backgroundColor;
    this.slider.classList.add(this.classes.sliderClass);
    this.container.classList.add(colorIsBright(bgColor) ? this.classes.dark : this.classes.light);
  }

  initSlides() {
    this.slideList.forEach(slide => {
      slide.classList.add(this.classes.slideClass);
    })
  }

  observerCallback(entries) {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add(this.classes.visible);
      } else {
        entry.target.classList.remove(this.classes.visible);
      }
    })
  }

  buildArrows() {
    if(typeof(this.selectors.prevArrow) !== 'string') {
      const newNode = document.createElement('button');
      newNode.text = 'previous';
      this.slider.parentNode.insertBefore(newNode, this.slider);
      newNode.addEventListener('click', this.navigateToPrevSlide.bind(this));
    } else {
      this.slider.parentNode.querySelector(this.selectors.prevArrow).addEventListener('click', this.navigateToPrevSlide.bind(this))
    }
    if(typeof(this.selectors.nextArrow) !== 'string') {
      const newNode = document.createElement('button');
      newNode.text = 'next';
      this.slider.parentNode.insertBefore(newNode, this.slider);
      newNode.addEventListener('click', this.navigateToNextSlide.bind(this));
    } else {
      this.slider.parentNode.querySelector(this.selectors.nextArrow).addEventListener('click', this.navigateToNextSlide.bind(this))
    }
  }

  navigateToNextSlide() {
    const lastActiveSlide = this.slideList.findLast(slide => {
      return slide.classList.contains(this.classes.visible)
    });
    const slideIndex = this.slideList.indexOf(lastActiveSlide);
    if(slideIndex < this.slideList.length - 1) {
      const firstInactiveSlide = this.slideList[slideIndex + 1];
      const scrollableArea = this.slider.scrollWidth - this.slider.clientWidth;
      let cardCoordinate = (firstInactiveSlide.offsetLeft + firstInactiveSlide.clientWidth - this.slider.scrollWidth) + scrollableArea;
      if(cardCoordinate < 50) {
        cardCoordinate+= firstInactiveSlide.clientWidth;
      }
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
      const cardCoordinate = firstInactiveSlide.offsetLeft;
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

    const scrollableArea = this.slider.scrollWidth - this.slider.clientWidth;
    const cardCoordinate = (selectedSlide.offsetLeft + (selectedSlide.clientWidth / 2) + selectedSlide.clientWidth - this.slider.scrollWidth) + scrollableArea;

    this.slider.scrollTo({
      left: cardCoordinate,
      behavior: 'smooth'
    })
  }
}
