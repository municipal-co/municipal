import $ from 'jquery';
import Dropdown from '../ui/dropdown';
import { find } from '../core/utils';

class DropdownManager {
  constructor() {
    this.closeDropdownTimeout = null;
    this.closeDropdownTimeoutDuration = 80;
    this.dropdowns = [];
    this.activeDropdown = undefined;
    this.touchDevice = Modernizr && Modernizr.touchevents;
  }

  register($trigger) {
    const dd = new Dropdown($trigger);

    if (this.touchDevice) {
      dd.$trigger.on('click', this.onTriggerTouchClick.bind(this, dd));
    }
    else {
      dd.$trigger.on('mouseenter', this.onTriggerMouseEnter.bind(this, dd));
      dd.$trigger.on('mouseleave', this.onTriggerMouseLeave.bind(this, dd));
      dd.$el.on('mouseleave', this.onDropdownMouseLeave.bind(this, dd));
      dd.$el.on('mouseenter', this.onDropdownMouseEnter.bind(this, dd));
    }

    this.dropdowns.push(dd);
  }

  getDropdownByBlockId(id) {
    return find(this.dropdowns, 'blockId', id);
  }

  onTriggerMouseEnter(dd, e) {
    this.stopCloseTimeout();
    this.openDropdown(dd);
  }

  onTriggerMouseLeave(dd, e) {
    this.startCloseTimeout(dd);
  }

  onTriggerTouchClick(dd, e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleDropdown(dd);
  }

  onDropdownMouseEnter(dd, e) {
    this.stopCloseTimeout();
  }

  onDropdownMouseLeave(dd, e) {
    this.startCloseTimeout(dd);
  }

  toggleDropdown(dd) {
    return this.activeDropdown === dd ? this.closeDropdown(dd) : this.openDropdown(dd);
  }

  openDropdown(dd) {
    if (this.activeDropdown !== dd) {
      this.closeAllDropdowns();
      dd.open();

      this.activeDropdown = dd;
    }
  }

  closeDropdown(dd) {
    dd.close();

    if (this.activeDropdown === dd) {
      this.activeDropdown = undefined;
    }
  }

  closeAllDropdowns() {
    $.each(this.dropdowns, (i, dd) => {
      if (dd.isOpen()) {
        dd.close();
      }
    });

    this.activeDropdown = undefined;
  }

  startCloseTimeout(dd) {
    this.closeDropdownTimeout = setTimeout(this.closeDropdown.bind(this, dd), this.closeDropdownTimeoutDuration);
  }

  stopCloseTimeout() {
    clearTimeout(this.closeDropdownTimeout);
  }
}

export default new DropdownManager();
