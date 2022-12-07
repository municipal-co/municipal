const processName = (name) => {
  const underscorePosition = name.indexOf('_');
  switch (underscorePosition) {
    case 0:
      return `$ ${name.replace('_', '')}`
    case name.length - 1:
      return `$ ${name.replace('_', ' & Up')}`
    default:
      return `$ ${name.replace('_', ' - $')}`
  }
}

const handleize = (string) => {
  return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '')
}

const buildUrlSearchParams = (params) => {
  const searchParams = new URLSearchParams(document.location.search);

  params.filters.forEach((filter) => {
    if(filter.type == 'range') {
      let valuesList = [];
      filter.values.forEach(value => {
        valuesList.push(`${value?.from != undefined ? value?.from : ''}_${value?.to != undefined ? value?.to : ''}`);
      });
      if(valuesList.length == 0) {
        searchParams.delete(`filter-${filter.name.toLowerCase()}`);
      } else {
        searchParams.set(`filter-${filter.name.toLowerCase()}`, valuesList.join(','));
      }
    } else {
      let valuesList = [];
      filter.values.forEach(value => {
        valuesList.push(value.value);
      })
      if(valuesList.length == 0) {
        searchParams.delete(`filter-${filter.name.replace('custom_fields.','').toLowerCase()}`)
      } else {
        searchParams.set(`filter-${filter.name.replace('custom_fields.','').toLowerCase()}`, valuesList.join(','))
      }
    }
  })

  if(params.page !== 1) {
    searchParams.set('page', params.page);
  } else {
    searchParams.delete('page');
  }

  return searchParams;
}

export { processName, handleize, buildUrlSearchParams }
