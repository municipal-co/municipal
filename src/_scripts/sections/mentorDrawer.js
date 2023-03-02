import $ from 'jquery';
import Handlebars from 'handlebars';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  drawer: '[data-drawer]',
  template: '[data-template]',
  mentorForm: '[data-mentor-form]',
  drawerBody: '[data-drawer-body]',
  closeButton: '[data-drawer-close]',
  submitMessage: '[data-submit-message]',
}

const classes = {
  submitted: 'is-submitted',
  error: 'has-error'
}



export default class MentorDrawer extends BaseSection {
  constructor(container) {
    super(container, 'mentorDrawer');
    this.template         = $(selectors.template, this.$container);

    this.$drawer          = $(selectors.drawer, this.$container);
    this.$drawerBody      = $(selectors.drawerBody, this.$container);
    this.$drawerClose     = $(selectors.$drawerClose, this.$container);
    this.bodyTemplate     = Handlebars.compile(this.template.html());

    this.drawer           = new Drawer(this.$drawer);

    this.$drawer.get(0).addEventListener('submit', this.formSubmit.bind(this));
    document.addEventListener('drawer-open:mentor', this.openDrawer.bind(this));
  }

  openDrawer(e) {
    this.mentorsData = JSON.parse(e.detail.mentorsData);
    const mentorId = e.detail.mentorId;
    const mentorData = this.getMentorData.call(this, mentorId);
    this.updateDrawerBody.call(this, mentorData);
    this.drawer.show();
  }

  getMentorData(mentorId) {
    console.log(typeof(this.mentorsData));
    const mentor = this.mentorsData.find(data => {
      return data.mentor_id === mentorId;
    })

    return mentor;
  }

  updateDrawerBody(mentorData) {
    this.$drawerBody.empty().append(this.bodyTemplate(mentorData));
  }

  formSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target;
    const $submitMessage = form.querySelector(selectors.submitMessage);
    const mentorKey = `Mentor - ${form.querySelector('[name="$mentor"]').value}`
    const formData = {
      g: 'T5BTNZ',
      $email: form.querySelector('input[type="email"]').value,
      $source: 'Mentor Flyout',
      $fields: `$source, ${mentorKey}`,

    }
    formData[mentorKey] = true;

    const dataString = new URLSearchParams(formData).toString();

    fetch(form.action, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cache-Control': 'no-cache'
      },
      body: dataString,
    }).then(res => {
      res.json();
    }).then(data => {
      form.classList.add('is-submitted');
      $submitMessage.innerText = 'Thanks for your entry! We\'ll reach out soon if you\'re selected.';
    }).catch(error => {
      console.error(error);
      form.classList.add('has-error');
      $submitMessage.innterText = 'There was an error with your submission, please try again later.';
      setTimeout(() => {
        form.classList.remove('has-error');
      }, 5000);

      setTimeout(() => {
        $submitMessage.innerText = '';
      }, 5200);
    })
  }
};