import $ from 'jquery';
import { throttle } from 'throttle-debounce';

export default class backgroundAnimation {
  constructor(sections, callback, settings) {
    this.$sections = $(sections);
    this.$window = $(window);
    this.moduleList = [];
    this.currentScrollPosition = window.scrollY;
    this.viewportHeight = this.$window.height();
    this.topThreshold = this.viewportHeight * 0.4;
    this.bottomThreshold = this.viewportHeight * 0.6;

    this.buildModulesList.call(this);
    // Call this to apply the first module background color
    this.checkModulesPosition.call(this);

    this.$window.on('scroll', throttle(50, this.checkModulesPosition.bind(this)));
    this.$window.on('resize', this.updateViewportHeight.bind(this));
  }


  buildModulesList() {
    this.$sections.each((index, el) => {
      const $el = $(el);

      this.moduleList.push({
        module: $el,
        backgroundColor: $el.data('animated-background')||'',
        isActive: false
      })
    });
  }

  checkModulesPosition() {
    const self = this;
    const screenTopLimit = this.viewportHeight - this.topThreshold;
    const screenBottomLimit = this.viewportHeight - this.bottomThreshold;

    $.each(this.moduleList, (index, el) => {
      const position = el.module.get(0).getBoundingClientRect();

      if (window.scrollY > self.currentScrollPosition) {
        if (!el.isActive &&
            position.top < screenTopLimit &&
            position.bottom >= screenTopLimit &&
            el.backgroundColor !== '' ) {
          $('body').css('background-color', el.backgroundColor);
          self.updateActiveModule.call(self, el);
        }
      } else if(!el.isActive &&
            position.top < screenBottomLimit &&
            position.bottom >= screenBottomLimit &&
            el.backgroundColor !== '' ) {
        $('body').css('background-color', el.backgroundColor);
        self.updateActiveModule.call(self, el);
      }
    });

    this.currentScrollPosition = window.scrollY;
  }

  updateActiveModule(currentModule) {
    const self = this;
    $.each(this.moduleList, (index, module) => {
      if (module !== currentModule && module.isActive === true) {
        self.moduleList[index].isActive = false;
      }
      if (module === currentModule) {
        self.moduleList[index].isActive = true;
      }
    });
  }

  updateViewportHeight() {
    this.viewportHeight = this.$window.height();
    this.topThreshold = this.viewportHeight * 0.4;
    this.bottomThreshold = this.viewportHeight * 0.6;
  }
}
