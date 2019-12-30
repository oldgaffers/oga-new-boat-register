import React from 'react';
import { Container, Grid, Header, List, Tab } from 'semantic-ui-react';
import TopMenu from './TopMenu';

const RegistrationAndLocation = () => {
    return (
        <Tab.Pane>
            <List>
                <List.Item header='Previous name/s' content='Piros' />
                <List.Item header='Place built' content='Bordeaux' />
                <List.Item header='Approximate Year of Build' content='1910' />
                <List.Item header='Sail no.' content='394Y' />
                <List.Item header='Home country' content='GRE' />
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

const Boat = ({id}) => {
    return (
        <Container>
            <TopMenu/>
            <Grid columns={2} divided>
                <Grid.Row>
                    <Grid.Column width={10}>
                        <Header as="h1">This is boat {id}</Header>
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