import React from 'react';
import { Card, Image, Segment, Divider, Container } from 'semantic-ui-react'
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
      prev_name
      builder{ name }
      class{
        name
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
  prev_name: { label: "Previous name(s)" }
};

const Boats = ({page, boatsPerPage, filters, onLoad}) => {

  const { loading, error, data } = useQuery(query(page, boatsPerPage, filters));
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

  if(data.boats.totalCount === 0) {
    return (<Container><p>There are no boats which match the filter criteria you have set. Try broadening the criteria.</p>
      <p>The criteria currently set are:</p><p>Boats
        {
          Object.keys(filters).map((key) => {
            const value = filters[key];
            if(value) {
              switch(key) {
                case 'name':
                    return ' called '+value;
                  case 'rigType':
                    return " with a rig type of "+value;
                  case 'sailType':
                    return " with a sail type of "+value;
                  case 'minYear':
                    return " built after the start of "+value;
                  case 'maxYear':
                    return " built before the end of "+value;
                  case 'constructionMaterial':
                    return " made of "+value;
                  case 'genericType':
                    return " that are "+value+"s";
                  case 'designClass':
                    return " that are "+value+" class boats";
                  case 'builder':
                  return " built by "+value;
                  case 'designer':
                    return " designed by "+value;
                  case 'has_images':
                    return " with"+(value?'':'out')+" pictures";
                  case 'for_sale':
                    return (value?' ':' not ')+"for sale";
                  default: return '';
              }
            }
            return '';
          })
        }
        .</p>
    </Container>);
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