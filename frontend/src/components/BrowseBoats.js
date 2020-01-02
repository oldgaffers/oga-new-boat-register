import React, { useState, useEffect } from 'react';
import Boats from './Boats.js';
import { CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';
import SearchAndFilterBoats from './SearchAndFilterBoats.js';

const BrowseBoats = () => {

  useEffect(() => {
      document.title = "Browse Boats";
  });

  const [activePage, setActivePage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [boatsPerPage, setBoatsPerPage] = useState(12);
  const [filters, setFilters] = useState({});

  const onLoad = (totalCount) => {
    setPageCount(Math.ceil(totalCount/boatsPerPage));
  }

  const onSearch = (filters) => {
    console.log('onSearch', filters);
    setFilters(filters);
  }

  const onResetFilters = () => {
    console.log('resetFilters from', filters);
    setFilters({});
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
    console.log('pageSizeUpdated', size);
    setBoatsPerPage(size);
  };

  return (
    <Container>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <Container>
      <SearchAndFilterBoats 
      onReset={onResetFilters} onSearch={onSearch} 
      onUpdate={filtersUpdated} onPageSize={pageSizeUpdated} filters={filters}
      />
      <Pagination 
      activePage={activePage}
      onPageChange={onChange}
      totalPages={pageCount}
      ellipsisItem={null}
       />
    </Container>
    <Divider />
    <CardGroup>
      <Boats page={activePage} filters={filters} boatsPerPage={boatsPerPage} onLoad={onLoad} />
    </CardGroup>
    <Divider />
    <Container>
      <Pagination 
      activePage={activePage}
      onPageChange={onChange}
      totalPages={pageCount}
      ellipsisItem={null}
       />
    </Container>
  </Container>
  );
};

export default BrowseBoats;