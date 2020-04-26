import React, { useState, useEffect } from 'react';
import { Responsive, CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import SearchAndFilterBoats from './searchandfilterboats';
import Boats from './boats';

const DEFAULT_FILTERS = {
  name:null,
  oga_no:null,
  rigType:null,
  sailType:null,
  minYear:1800,
  maxYear:(new Date()).getFullYear(),
  designer:null,
  builder:null,
  designClass:null,
  genericType:null,
  constructionMaterial:null,
  has_images: true,
  for_sale:null,
  sortBy:'name',
  reverse:null
};

// TODO for_sale previous names, design class

function makeWhere(filters) {
  let r = {
    _and:[
      { year: { _gte: filters.minYear } },
      { year: { _lte: filters.maxYear } }
    ],
  };
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      switch (key) {
        case 'name':
          r.name = { _or: [
            { previous_names: {_contains: filters.name }},
            { name: { _ilike: `%${filters.name}%` } }
          ] };
          break;
        case 'oga_no':
          r.oga_no = { _eq: filters.oga_no }
          break;
        case 'designer':
          r.designerByDesigner = { name: { _ilike: `%${filters.designer}%` } }
          break;
        case 'builder':
          r.builderByBuilder = { name: { _ilike: `%${filters.builder}%` } }
          break;
        case 'has_images':
          r.image_key = { _is_null: filters.has_images };
          break;
        case 'rigType':
          r.rigTypeByRigType = { name: { _eq: filters.rigType } }
          break;
        case 'sailType':
          r.sailTypeBySailType = { name: { _eq: filters.sailType } }
          break;
        case 'genericType':
          r.genericTypeByGenericType = { name: { _eq: filters.genericType } }
          break;
        case 'designClass':
          r.designClassByDesignClass = { name: { _eq: filters.designClass } }
          break;
        case 'constructionMaterial':
          r.constructionMaterialByConstructionMaterial = { name: { _eq: filters.constructionMaterial } }
          break;
        default:
          // omit
      }
    }
  });
  return r;
}
const BrowseBoats = () => {

  useEffect(() => {
      document.title = "Browse Boats";
  });

  const [activePage, setActivePage] = useState(1);
  const [boatsPerPage, setBoatsPerPage] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const onLoad = (totalCount) => {
    setTotalCount(totalCount);
  }

  const onResetFilters = () => {
    console.log('resetFilters from', filters, 'to', DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }

  const onChange = (_, pageInfo) => {
    setActivePage(pageInfo.activePage);
    console.log(pageInfo);
  };

  const filtersUpdated = (newFilters) => {
    console.log('filtersUpdated from', filters, 'to', newFilters);
    setFilters(newFilters);
  };

  const pageSizeUpdated = (size) => {
    setBoatsPerPage(size);
  };

  const pageCount = Math.ceil(totalCount/boatsPerPage);

  return (
  <Responsive minWidth={Responsive.onlyTablet.minWidth}>
    <Container>
      <Header as="h1">Browse Boats</Header>
      <Header as="h3">
        We have hundreds of boats with pictures and many more waiting for pictures and more information.
      </Header>
      <Container>Filter the list using the options below and then click on a boat for all the pictures and data we have for that boat.
        <p>Know something we don't? We'd love to hear from you.</p>
      </Container>
      <SearchAndFilterBoats 
      onReset={onResetFilters}
      onUpdate={filtersUpdated} onPageSize={pageSizeUpdated}
      filters={filters} boatsPerPage={boatsPerPage}
      />
    </Container>
    <Divider />
    <Container>
    <Pagination activePage={activePage} onPageChange={onChange}
                  totalPages={pageCount} ellipsisItem={null}
      />
      <Divider hidden />
    <CardGroup centered>
      <Boats
        page={activePage}
        boatsPerPage={boatsPerPage}
        where={makeWhere(filters)}
        sortField={filters.sortBy}
        sortDirection={filters.reverse?'desc':'asc'}
        onLoad={onLoad}
      />
    </CardGroup>
    <Divider hidden />
      <Pagination activePage={activePage} onPageChange={onChange}
                  totalPages={pageCount} ellipsisItem={null}
      />
      </Container>
      <Divider hidden />
  </Responsive>
  );
};

export default BrowseBoats