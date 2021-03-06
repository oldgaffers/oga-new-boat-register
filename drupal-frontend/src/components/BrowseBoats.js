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
    <TopMenu/>
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
      <Boats page={activePage} filters={filters} boatsPerPage={boatsPerPage} onLoad={onLoad} />
    </CardGroup>
    <Divider hidden />
      <Pagination activePage={activePage} onPageChange={onChange}
                  totalPages={pageCount} ellipsisItem={null}
      />
      </Container>
      <Divider hidden />
    <Friendly/>
  </Responsive>
  );
};

export default BrowseBoats;