import React, { useState } from 'react';
import Boats from './Boats.js';
import { CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';
import SearchAndFilterBoats from './SearchAndFilterBoats.js';

const BrowseBoats = () => {

  const [activePage, setActivePage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [boatsPerPage] = useState(8);

  const onLoad = (totalCount) => {
    console.log(totalCount);
    setPageCount(Math.ceil(totalCount/boatsPerPage));
  }

  const onChange = (_, pageInfo) => {
    setActivePage(pageInfo.activePage);
    console.log(pageInfo);
  };

  return (
    <Container>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <Container>
      <SearchAndFilterBoats/>
      <Pagination 
      activePage={activePage}
      onPageChange={onChange}
      totalPages={pageCount}
      ellipsisItem={null}
       />
    </Container>
    <Divider />
    <CardGroup>
      <Boats page={activePage} boatsPerPage={8} onLoad={onLoad} />
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