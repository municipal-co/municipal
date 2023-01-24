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

const calcOffset = (limit, page) => limit * (page - 1);

const getUrlFilters = () => {
  const urlParams = new URLSearchParams(document.location.search);
  const filterList = [];

  for(const [param, value] of urlParams.entries()) {
    if(param.indexOf('filter') > -1) {
      const valueList = value.split(',');
      // Text filters
      if(param.indexOf('price') == -1  ){
        filterList.push({
          name: `${param.indexOf('gender') > -1 ? 'custom_fields.Gender' : param.replace('filter-', '')}`,
          type: 'text',
          values: valueList.map(value => {
              return {value};
            })

        })
      } else {
        // Range filter
        const valueList = value.split(',');
        filterList.push({
          name: param.replace('filter-', ''),
          type: "range",
          values: valueList.map(value => {
            const underscorePosition = value.indexOf('_');
            const valuePieces = value.split('_');
            switch(underscorePosition) {
              case 0:
                return {to: `${valuePieces[1]}`}
              case value.length -1 :
                return {from: `${valuePieces[0]}`}
              default:
                return {from: `${valuePieces[0]}`, to: `${valuePieces[1]}`}
            }
          })
        })
      }
    }
  }

  return filterList;
}

const getURLSort = () => {
  let sortData = [];
  const queryParams = new URLSearchParams(document.location.search);
  if(queryParams.has('sort')){
    sortData = queryParams.get('sort').split(':');
  }

  return sortData;
}

export { processName, handleize, buildUrlSearchParams, calcOffset, getUrlFilters, getURLSort }
