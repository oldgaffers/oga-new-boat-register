import React from 'react';
import { Container } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import BoatCard from './boatcard';
import FilterDisplay from './filterdisplay';

const query = (sort) => gql`
query boats($where: boat_bool_exp!, $limit: Int!, $offset: Int!) {
    boat_aggregate(where: $where) { aggregate { totalCount: count } }
    boat(limit: $limit, offset: $offset, order_by: ${sort}, where: $where) {
      id name
      oga_no
      place_built
      previous_names
      home_port
      short_description
      year
      builderByBuilder{name}
      designerByDesigner{name}
      design_class
      image_key
    }
  }`;

const labels = {
  place_built: { label: 'Place Built' },
  home_port: { label: 'Home Port' },
  class: {
    rigType: { label: 'Rig Type' },
    designer: { name: { label: 'Designer' } },
  },
  builder: { name: { label: 'Builder' } },
  prev_name: { label: 'Previous name(s)' },
};

const Boats = ({ page, boatsPerPage, sortField, sortDirection, where, onLoad }) => {
  const { loading, error, data } = useQuery(
      query(`{${sortField}: ${sortDirection}}`),
      {
        variables: {
            limit: boatsPerPage,
            offset: boatsPerPage*(page-1),
            where: where,
        }
      }
  );
  if (error) return <p>Error :(TBD)</p>;

  if (loading) {
    if (data) {
      console.log('Loading set but data here');
    } else {
      return <p>Loading...</p>;
    }
  }

  const totalCount = data.boat_aggregate.aggregate.totalCount;

  if (onLoad) {
    onLoad(totalCount);
  }

  if (totalCount > 0) {
    return data.boat.map((boat) => <BoatCard boat={boat} labels={labels} />);
  }
  return (
    <Container>
      <p>
        There are no boats which match the filter criteria you have set. Try
        broadening the criteria.
      </p>
      <FilterDisplay />
    </Container>
  );
};

export default Boats;
