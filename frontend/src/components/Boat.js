import React from 'react';
import { Container, Grid, Header, List, Tab } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import TopMenu from './TopMenu';

const query = (id) => gql`{
    boat(id:${id}) {
        name
        year
        whereBuilt
        place_built
        short_desc
        images{
            uri
            copyright
        }
        builder{name}
    }
  }`;


const Boat = ({id}) => {
    const { loading, error, data } = useQuery(query(id));

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;

    const boat = data.boat;

    const RegistrationAndLocation = () => {
        console.log(boat);
        return (
            <Tab.Pane>
                <List>
                    <List.Item header='Previous name/s' content={boat.previousNames} />
                    <List.Item header='Place built' content={boat.place_built} />
                    <List.Item header='Approximate Year of Build' content={boat.year} />
                    <List.Item header='Sail no.' content={boat.sail_no} />
                    <List.Item header='Home country' content={boat.home_country} />
                    <List.Item header='Small Ships Registry no. (SSR)' content='1353' />
                    <List.Item header='National Register of Historic Vessels no. (NRHV)' content='2323' />
            </List>
            </Tab.Pane>
        );
    }
    
    const panes = [
        { menuItem: 'Full Description', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
        { menuItem: 'Registration and location', render: RegistrationAndLocation },
        { menuItem: 'Rig and Sails', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
        { menuItem: 'Construction', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
        { menuItem: 'Hull', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
        { menuItem: 'Engine', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
      ];    

  
    return (
        <Container>
            <TopMenu/>
            <Grid columns={2} divided>
                <Grid.Row>
                    <Grid.Column width={10}>
                        <Header as="h1">{data.boat.name}</Header>
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Header as="h1">1910</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={10}>
                        gallery here
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Header as="h2">Details</Header>
                        description here
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            image list here
            <Tab panes={panes}/>
        </Container>
    );
};

export default Boat;