import React, { useState } from 'react';
import Boats from './Boats.js';
import { CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';
import SearchAndFilterBoats from './SearchAndFilterBoats.js';

const BrowseBoats = () => {

  const [activePage, setActivePage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [boatsPerPage] = useState(8);
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

  return (
    <Container>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <Container>
      <SearchAndFilterBoats 
      onReset={onResetFilters} onSearch={onSearch} onUpdate={filtersUpdated}
      />
      <Pagination 
      boundaryRange=''
      activePage={activePage}
      onPageChange={onChange}
      totalPages={pageCount}
      ellipsisItem='...'
       />
    </Container>
    <Divider />
    <CardGroup>
      <Boats page={activePage} boatsPerPage={boatsPerPage} onLoad={onLoad} />
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