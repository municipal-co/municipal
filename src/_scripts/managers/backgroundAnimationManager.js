import $ from 'jquery';
import { throttle } from 'throttle-debounce';

export default class backgroundAnimation {
  constructor(sections, callback, settings) {
    this.$sections = $(sections);
    this.$window = $(window);
    this.moduleList = [];
    this.currentScrollPosition = window.scrollY;
    this.viewportHeight = this.$window.height();
    this.topThreshold = this.viewportHeight * window.animationSettings.backgroundAnimationThreshold.top;
    this.bottomThreshold = this.viewportHeight * window.animationSettings.backgroundAnimationThreshold.bottom;

    this.buildModulesList.call(this);

    // Call this to apply the first module background color
    this.setInitialBackgroundColor.call(this);

    this.$window.on('scroll', throttle(50, this.checkModulesPosition.bind(this)));
    this.$window.on('resize', this.updateViewportHeight.bind(this));
  }

  setInitialBackgroundColor() {

    const self = this;
    const el = self.moduleList[0];

    // if there are no modules configured, bail
    if (typeof self.moduleList[0] === 'undefined') {
      return;
    }

    // set background color based on the first module on page load
    $('body').css('background-color', el.backgroundColor);
    self.currentBackground = el.backgroundColor.substring(1);
    self.updateActiveModule.call(self, el);

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
          self.currentBackground = el.backgroundColor.substring(1);
          self.updateActiveModule.call(self, el);
        }
      } else if(!el.isActive &&
            position.top < screenBottomLimit &&
            position.bottom >= screenBottomLimit &&
            el.backgroundColor !== '' ) {
        $('body').css('background-color', el.backgroundColor);
        self.currentBackground = el.backgroundColor.substring(1);
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
      self.updateModuleTextColor(module.module, self.moduleList[index].isActive);
    });
  }

  updateViewportHeight() {
    this.viewportHeight = this.$window.height();
    this.topThreshold = this.viewportHeight * 0.4;
    this.bottomThreshold = this.viewportHeight * 0.6;
  }

  updateModuleTextColor(module, moduleIsActive) {
    const $module = $(module);

    if(!moduleIsActive) {
      const rgbColor = this._breakColorIntoRGB(this.currentBackground);
      const colorLuminance = this._getColorLuminance(rgbColor.r, rgbColor.g, rgbColor.b);

      const useWhite = this._compareLuminance(colorLuminance);
      if(useWhite) {
          $module.removeClass('inactive-black');
          $module.addClass('inactive-white');
        } else {
          $module.removeClass('inactive-white');
          $module.addClass('inactive-black');
      }
    } else {
      $module.removeClass('inactive-white inactive-black');
    }
  }

  _breakColorIntoRGB(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  _getColorLuminance(r, g, b) {
    const a = [r, g, b].map(function(v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  _compareLuminance(color1luminance, color2luminance = 1) {
    const ratio = color1luminance > color2luminance
    ? ((color2luminance + 0.05) / (color1luminance + 0.05))
    : ((color1luminance + 0.05) / (color2luminance + 0.05));

    let optimumContrast;
    if( ratio < 1/4.5 ) {
      optimumContrast = true;
    } else {
      optimumContrast = false;
    }

    return optimumContrast;
  }

}
