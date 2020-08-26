import $ from 'jquery';

const selectors = {
  sections: '[data-animated-background]'
}

export default class SectionFadeInAnimation {
  constructor() {
    this.sections = [];
    this.name = 'FadeInAnimation';
    this.namespace = `.${this.name}`;

    this.animationBottomMargin = window.animationSettings.sectionAnimationThreshold !== undefined ? window.animationSettings.sectionAnimationThreshold + 200 : 200;

    this.intersectionOptions = {
      root: null,
      threshold: 0.01,
      rootMargin: `0px 0px ${this.animationBottomMargin}px 0px`,
    }

    this.intersectionObserver = new IntersectionObserver(
      this.sectionOnScreen,
      this.intersectionOptions
    );

    this._registerSections();
  }

  sectionOnScreen(entries, observer) {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        $(entry.target).addClass('in');
        observer.unobserve(entry.target);
      }
    })
  }

  _registerSections() {
    const $sectionList = $(selectors.sections);
    const windowHeight = $(window).scrollTop() + $(window).height();

    $sectionList.each((index, el) => {
      const $el = $(el);
      const sectionTop = $el.offset().top;

      if( sectionTop > windowHeight ) {
        // Module is below the fold
        $el.addClass('fade-animate');
        this.intersectionObserver.observe(el);
      }
    });
  }
}
