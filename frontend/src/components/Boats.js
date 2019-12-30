import React from 'react';
import { Card, Image, Segment } from 'semantic-ui-react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const query = (pageSize) => gql`{
  boats2(first:${pageSize}) {
    boats{
      id
      oga_num
      name
      image
      year
      builder{ name }
      class{
        name
        rigType
        mainsailType
        designer{ name }
      }
    }
  }
}`;

// use this for graphQL enums
const capitalise = (s) => s.toLowerCase().replace(/^\w/, c => c.toUpperCase());

const Boats = ({pageSize}) => {

  const { loading, error, data } = useQuery(query(pageSize));

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>;

  return data.boats2.boats.map((boat) => (
    <Card key={boat.id}>
      <Image src={boat.image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>
          <Segment.Group horizontal>
            <Segment>{boat.name} ({boat.oga_num})</Segment>
            <Segment></Segment>
            <Segment>{boat.year}</Segment>
          </Segment.Group>
        </Card.Header>
        <Card.Meta>
          <span className='rig_type'>Rig Type {capitalise(boat.class.rigType)}</span>
        </Card.Meta>
        <Card.Meta>
          <span className='place_built'>Built {boat.builder.location}</span>
        </Card.Meta>
        <Card.Meta>
          <span className='place_built'>Home port or other location {boat.homePort}</span>
        </Card.Meta>
        <Card.Meta>
          <span className='place_built'>Builder {boat.builder.name}</span>
        </Card.Meta>
        <Card.Meta>
          <span className='place_built'>Designer {boat.class.designer.name}</span>
        </Card.Meta>
        <Card.Description>
          View all Details
        </Card.Description>
      </Card.Content>
    </Card>
  ));
}

export default Boats;