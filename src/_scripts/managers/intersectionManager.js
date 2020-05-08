import $ from 'jquery';

export default class intersectionManager {
  constructor(objects, callback, settings) {
    this.$objects = $(objects);
    this.currentScrollPosition = window.scrollY;
    this.thresholdDown = window.innerHeight * 0.7;
    this.thresholdUp = window.innerHeight * 0.3;

    const self = this;
    this.settings = settings || {
      root: null,
      threshold: this._buildIntersectionThresholds()
    };

    if (typeof callback === 'function') {
      this.intersectionObserver = new IntersectionObserver(callback.bind(this), this.settings);

      this.$objects.each((index, object) => {
        self.intersectionObserver.observe(object);
      });
    }
  }

  _buildIntersectionThresholds(thresholds = 50) {
    const intersectionThreshold = [];

    for (let i = 0; i <= thresholds; i++) {
      const calc = i / 50;
      intersectionThreshold.push(calc);
    }

    return intersectionThreshold;
  }
}
