import React from 'react';
import { Card, Image, Segment } from 'semantic-ui-react'
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const query = (page, boatsPerPage) => gql`{
  boats(page:${page}, boatsPerPage:${boatsPerPage}) {
    totalCount
    hasNextPage
    hasPreviousPage
    boats{
      id
      oga_num
      name
      image
      year
      homePort
      whereBuilt
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

const Boats = ({page, boatsPerPage, onLoad}) => {

  const { loading, error, data } = useQuery(query(page, boatsPerPage));

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
            <Segment>{boat.name} ({boat.oga_num})</Segment>
            <Segment></Segment>
            <Segment>{boat.year}</Segment>
          </Segment.Group>
        </Card.Header>
        <Card.Meta>
          Rig Type<span className='rig_type'>{capitalise(boat.class.rigType)}</span>
        </Card.Meta>
        <Card.Meta>
        Built <span className='place_built'>{boat.whereBuilt}</span>
        </Card.Meta>
        <Card.Meta>
        Home port <span className='home_port'>{boat.homePort}</span>
        </Card.Meta>
        <Card.Meta>
        Builder <span className='builder'>{boat.builder.name}</span>
        </Card.Meta>
        <Card.Meta>
          Designer <span className='designer'>{boat.class.designer.name}</span>
        </Card.Meta>
        <Card.Description>
          View all Details
        </Card.Description>
      </Card.Content>
    </Card>
  ));
}

export default Boats;