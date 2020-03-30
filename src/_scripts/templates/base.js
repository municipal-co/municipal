import $ from 'jquery';

// You shouldn't really be using the template script setup but if you *need* to, extend from this class and put all your
// eventHandlers in a method called `addEventHandlers`

export default class BaseTemplate {
  constructor(templateBodyClass) {
    if (templateBodyClass !== undefined && $(document.body).hasClass(templateBodyClass)) {
      this.addEventHandlers();
    }
  }

  addEventHandlers() {
    //
  }
}
