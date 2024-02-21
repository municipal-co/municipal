import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

export default class ShopifySearch extends BaseSection {
  constructor(container) {
    super(container, 'shopify-search');
    this.isOpen = false;
    this.isLoading = false;

    this.currentSearchParam = new URLSearchParams(window.location.search).get('q');

    this.$filterToggler = document.querySelector('[data-filter-toggler]');
    this.$filterActionText = document.querySelector('[data-filter-action-text]');
    this.$productGrid = document.querySelector('[data-product-grid]');
    this.$sortSelect = document.querySelector('[data-sort-select]');
    this.$filterDrawer = document.querySelector('[data-filter-drawer]');
    this.$searchResultsSummary = document.querySelector('.findify-result-summary');

    this.$filterToggler?.addEventListener('click', this.toggleFilterDrawer.bind(this));
    this.$sortSelect?.addEventListener('change', this.applyFilters.bind(this));

    this.initDynamicEvents();
  }

  initDynamicEvents() {
    this.$runFilters = document.querySelector('[data-run-filters]');
    this.$closeFilters = document.querySelector('[data-close-filters]');
    this.$filterGroupToggler = document.querySelectorAll('[data-filter-group-toggler]');
    this.$applyPriceChange = document.querySelector('[data-apply-price-change]');
    this.$clearFiltersBtn = document.querySelectorAll('[data-clear-filters]');

    this.$closeFilters?.addEventListener('click', this.closeFilters.bind(this));
    this.$runFilters?.addEventListener('click', this.applyFilters.bind(this));
    this.$applyPriceChange?.addEventListener('click', this.applyFilters.bind(this));
    this.$clearFiltersBtn?.forEach((btn) => {
      btn.addEventListener('click', this.clearFilters.bind(this));
    })
    if(this.$filterGroupToggler.length > 0) {
      this.$filterGroupToggler.forEach((toggler) => {
        toggler.addEventListener('click', this.toggleFilterGroup.bind(this));
      })
    }

    const filterCheckboxes = this.$filterDrawer.querySelectorAll('input[type=checkbox]');
    filterCheckboxes?.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if(window.innerWidth > 991) {
          this.applyFilters();
        }
      });
    });
  }

  toggleFilterDrawer() {
    this.$filterDrawer.classList.toggle('is-open');
    if(this.isOpen) {
      this.$filterToggler.parentElement.classList.remove('is-open', 'col-lg-8', 'col-xl-6');
      this.$productGrid.classList.remove('col-lg-16', 'col-xl-18');
      this.$productGrid.classList.add('col-24');
      this.$clearFiltersBtn.forEach((btn) => {
        btn.style.setProperty('display', 'none', 'important');
      })
    } else {
      this.$filterToggler.parentElement.classList.add('is-open', 'col-lg-8', 'col-xl-6');
      this.$productGrid.classList.add('col-lg-16', 'col-xl-18');
      this.$productGrid.classList.remove('col-24');
      this.$clearFiltersBtn.forEach((btn) => {
        btn.style.display = null;
      })
    }
    this.$filterActionText.textContent = this.isOpen ? 'Close' : 'Open';
    this.isOpen = !this.isOpen;
  }

  toggleFilterGroup(evt) {
    const filterName = evt.currentTarget.dataset.filterName;
    const $filterGroup = this.$filterDrawer.querySelector(`[data-filter-group="${filterName}"]`);

    if($filterGroup) {
      $filterGroup.classList.toggle('is-open');
      const isOpen = $filterGroup.classList.contains('is-open');
      const $filterActionLabel = $filterGroup.querySelector('[data-filter-action-label]');
      $filterActionLabel.textContent = isOpen ? 'Close' : 'Open';
    }
  }

  closeFilters() {
    this.$filterDrawer.classList.remove('is-open');
    this.$productGrid.classList.remove('col-lg-16', 'col-xl-18');
    this.$productGrid.classList.add('col-24');
    this.$filterActionText.textContent = 'Open';
    this.isOpen = false;
  }

  applyFilters = async () => {
    if(this.isLoading) return;

    const searchStructure = new URLSearchParams({ q: this.currentSearchParam});

    this.$filterDrawer.querySelectorAll('input:checked').forEach((input) => {
      searchStructure.append(input.name, input.value);
    });

    const priceMinValue = this.$filterDrawer.querySelector('input[name="filter.v.price.min"]')?.value;
    const priceMaxValue = this.$filterDrawer.querySelector('input[name="filter.v.price.max"]')?.value;

    if(priceMinValue) {
      searchStructure.append('filter.v.price.gte', priceMinValue);
    }

    if(priceMaxValue) {
      searchStructure.append('filter.v.price.lte', priceMaxValue);
    }

    searchStructure.append(this.$sortSelect.name, this.$sortSelect.value);

    this.isLoading = true;
    this.$productGrid.closest('.product-grid__body').classList.add('is-loading');

    this.fetchNewProducts(searchStructure.toString());
  }

  fetchNewProducts = async (searchParams) => {
    const newPage = await fetch(`${document.location.pathname}?${searchParams}`, {
      method: 'GET',
    }).then((response) => {
      return response.text();
    });

    const domParser = new DOMParser()
    const newDocument = domParser.parseFromString(newPage, 'text/html');

    this.$productGrid.replaceChildren(...newDocument.querySelector('[data-product-grid]').childNodes);
    this.$filterDrawer.replaceChildren(...newDocument.querySelector('[data-filter-drawer]').childNodes);
    if(this.$searchResultsSummary) {
      this.$searchResultsSummary.innerText = newDocument.querySelector('.findify-result-summary').innerText;
    }
    this.reloadProducts();
    this.initDynamicEvents();
    this.updateUrl(searchParams);
    this.isLoading = false;
    this.$productGrid.closest('.product-grid__body').classList.remove('is-loading');
    if(window.innerWidth < 992) {
      this.toggleFilterDrawer();
    }
    window.scrollTo({
      top: this.$productGrid.offsetTop,
      behavior: 'smooth'
    })


    const action = searchParams.indexOf('filter') > -1 ? 'add' : 'remove';
    this.$clearFiltersBtn.forEach((btn) => {
      if(btn.dataset.location == 'desktop') {
        btn.classList[action]('d-lg-block');
      }

      if(btn.dataset.location == 'mobile') {
        btn.classList[action]('d-block');
      }
    });
  }

  reloadProducts() {
    this.$productGrid.querySelectorAll('[data-product-card]').forEach((product) => {
      new ProductCard(product);
    });
  }

  updateUrl (urlParams) {
    window.history.pushState({}, '', `${window.location.pathname}?${urlParams}`);
  }

  clearFilters() {
    const currentUrlParams = new URLSearchParams(window.location.search);
    this.fetchNewProducts(`q=${currentUrlParams.get('q')}${currentUrlParams.get('sort_by') ? '&sort_by=' + currentUrlParams.get('sort_by') : ''}`);

    this.$filterDrawer.querySelectorAll('input:checked').forEach((input) => {
      input.checked = false;
    });
  }
}

