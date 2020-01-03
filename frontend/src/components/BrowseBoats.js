import React, { useState, useEffect } from 'react';
import Boats from './Boats.js';
import { Responsive, CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';
import Friendly from './Friendly.js';
import SearchAndFilterBoats from './SearchAndFilterBoats.js';

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
 
const BrowseBoats = () => {

  useEffect(() => {
      document.title = "Browse Boats";
  });

  const [activePage, setActivePage] = useState(1);
  const [boatsPerPage, setBoatsPerPage] = useState(12);
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const onLoad = (totalCount) => {
    setPageCount(Math.ceil(totalCount/boatsPerPage));
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
  
  return (
  <Responsive minWidth={Responsive.onlyTablet.minWidth}>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <Container>
      <SearchAndFilterBoats 
      onReset={onResetFilters}
      onUpdate={filtersUpdated} onPageSize={pageSizeUpdated}
      filters={filters} boatsPerPage={boatsPerPage}
      />
      <Pagination activePage={activePage} onPageChange={onChange}
                  totalPages={pageCount} ellipsisItem={null}
      />
    </Container>
    <Divider />
    <CardGroup>
      <Boats page={activePage} filters={filters} boatsPerPage={boatsPerPage} onLoad={onLoad} />
    </CardGroup>
    <Divider />
    <Container>
      <Pagination activePage={activePage} onPageChange={onChange}
                  totalPages={pageCount} ellipsisItem={null}
      />
    </Container>
    <Divider />
    <Friendly/>
  </Responsive>
  );
};

export default BrowseBoats;