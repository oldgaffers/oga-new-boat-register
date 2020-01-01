import React from 'react';
import { Card, Image, Segment } from 'semantic-ui-react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {A} from 'hookrouter';

const addFilters = (filters) => {
  let r='';
  Object.keys(filters).forEach(key => {
    r += `, ${key}:`
    switch(key) {
      case 'oga_no':
      case 'minYear':
      case 'maxYear':
        r += filters[key];
        break;
      default:
        r += `"${filters[key]}"`;
    }
  });
  console.log(r);
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

// use this for graphQL enums
const capitalise = (s) => {
  if(s) {
    return s.toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }
  return '';
}

const Boats = ({page, boatsPerPage, filters, onLoad}) => {

  const { loading, error, data } = useQuery(query(page, boatsPerPage, filters));

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(TBD)</p>;

  if(onLoad) {
    onLoad(data.boats.totalCount);
  }
  
  return data.boats.boats.map((boat) => (
    <Card key={boat.id}>
      <Image src={boat.image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>
          <Segment.Group horizontal>
            <Segment>{boat.name} ({boat.oga_no})</Segment>
            <Segment></Segment>
            <Segment>{boat.year_built}</Segment>
          </Segment.Group>
        </Card.Header>
        <Card.Meta>
          Rig Type <span className='rig_type'>{capitalise(boat.class.rigType)}</span>
        </Card.Meta>
        <Card.Meta>
        Built <span className='place_built'>{boat.place_built}</span>
        </Card.Meta>
        <Card.Meta>
        Home port <span className='home_port'>{boat.home_port}</span>
        </Card.Meta>
        <Card.Meta>
        Builder <span className='builder'>{boat.builder?boat.builder.name:''}</span>
        </Card.Meta>
        <Card.Meta>
          Designer <span className='designer'>{boat.class.designer?boat.class.designer.name:''}</span>
        </Card.Meta>
        <Card.Meta>
          Previous Names <span className='prev_name'>{boat.prev_name}</span>
        </Card.Meta>
        <Card.Description>
          <A href={"/boats/"+boat.oga_no}>View all Details</A>
        </Card.Description>
      </Card.Content>
    </Card>
  ));
}

export default Boats;