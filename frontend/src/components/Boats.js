import React from 'react';
import { Card, Image, Segment, Divider } from 'semantic-ui-react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {CardItems} from "./boat-utils";

const addFilters = (filters) => {
  let r='';
  Object.keys(filters).forEach(key => {
    if(filters[key]) {
      r += `, ${key}:`
      switch(key) {
        case 'oga_no':
        case 'minYear':
        case 'maxYear':
        case 'reverse':
        case 'has_images':
        case 'for_sale':
          r += filters[key];
          break;
        default:
          r += `"${filters[key]}"`;
      }  
    }
  });
  return r;
}

const query = (page, boatsPerPage, filters) => gql`{
  boats(page:${page}, boatsPerPage:${boatsPerPage}
    ${addFilters(filters)}
  ) {
    totalCount
    hasNextPage
    hasPreviousPage
    boats{
      id
      oga_no
      name
      image
      short_desc
      year_built
      home_port
      place_built
      construction_material
      prev_name
      builder{ name }
      class{
        name
        rigType
        mainsailType
        genericType
        designer{ name }
      }
    }
  }
}`;

const meta = {
  place_built: { label: "Place Built" },
  home_port: { label: "Home Port" },
  class: { 
    rigType: { label: "Rig Type" },
    designer: { name: { label: "Designer" } }
  },
  builder: { name: { label: "Builder" } },
  prev_name: { name: { label: "Previous name(s)" } }
};

const Boats = ({page, boatsPerPage, filters, onLoad}) => {

  // reverse meaning of sort direction if requested
  const queryFilters = {...filters};
  if(queryFilters.sortBy && queryFilters.sortBy.startsWith('!')) {
    queryFilters.reverse = !queryFilters.reverse;
    queryFilters.sortBy = queryFilters.sortBy.replace('!','');
  }

  const { loading, error, data } = useQuery(query(page, boatsPerPage, queryFilters));
  if (error) return <p>Error :(TBD)</p>;

  if (loading) {
    if(data) {
      console.log("Loading set but data here");
    } else {
      return <p>Loading...</p>
    }
  }

  if(onLoad) {
    onLoad(data.boats.totalCount);
  }
  
  return data.boats.boats.map((boat) => (
    <Card key={boat.id} href={"/boats/"+boat.oga_no}>
      <Image src={boat.image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>
          <Segment.Group horizontal>
            <Segment>{boat.name} ({boat.oga_no})</Segment>
            <Segment></Segment>
            <Segment>{boat.year_built}</Segment>
          </Segment.Group>
        </Card.Header>
        <Card.Description dangerouslySetInnerHTML={{ __html: boat.short_desc }} />
        <Divider/>
        <CardItems labels={meta} boat={boat}/>
      </Card.Content>
    </Card>
  ));
}

export default Boats;