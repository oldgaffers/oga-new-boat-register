import React, { useEffect } from 'react';
import { Container, Grid, Header, Image, List, Tab } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import TopMenu from './TopMenu';
import RigAndSails from './RigAndSails';
import ImageCarousel from './ImageCarousel';

const boatQuery = (id) => gql`{
    boat(id:${id}) {
        name
        prev_name
        year
        sail_no
        place_built
        home_country
        home_port
        ssr_no
        nhsr_no
        short_desc
        full_desc
        images{
            uri
            copyright
        }
        class{
            name
            rigType
            mainsailType
            hullType
            genericType
        }
        builder{name}
        construction_material
        construction_method
        beam
        draft
        length_on_waterline
        length_overall
        propulsion{
            propellor_type
            propellor_position
            propellor_blades
            engine_fuel
            engine_position
            engine_date
            engine_make
            engine_power
            hp
            previous_engine
        }
    }
  }`;


const ImageList = ({images}) => {
    if(images) {
        return images.map((image, i) =>(<Image key={i} src={image.uri} />   ));
    }
    return [];
}

const RegistrationAndLocation = ({boat}) => {
    return (
        <Tab.Pane>
            <List>
                <List.Item header='Previous name/s' content={boat.prev_name} />
                <List.Item header='Place built' content={boat.place_built} />
                <List.Item header='Approximate Year of Build' content={boat.year} />
                <List.Item header='Sail no.' content={boat.sail_no} />
                <List.Item header='Home country' content={boat.home_country} />
                <List.Item header='Small Ships Registry no. (SSR)' content={boat.ssr_no} />
                <List.Item header='National Register of Historic Vessels no. (NRHV)' content={boat.nhsr_no} />
        </List>
        </Tab.Pane>
    );
}

const Construction = ({boat}) => {
    return (
        <Tab.Pane>
            <List>
                <List.Item header='Construction method' content={boat.construction_method} />
                <List.Item header='Construction material' content={boat.construction_material} />
                <List.Item header='Hull Type' content={boat.class.hullType} />
                <List.Item header='Generic Type' content={boat.class.genericType} />
                <List.Item header='Builder' content={boat.builder.name} />
        </List>
        </Tab.Pane>
    );
}

const Hull = ({boat}) => {
    return (
        <Tab.Pane>
            <List>
                <List.Item header='Length on deck (LOD):' content={boat.length_overall+' ft'} />
                <List.Item header='Length on waterline (LWL):' content={boat.length_on_waterline+' ft'} />
                <List.Item header='Beam:' content={boat.beam+' ft'} />
                <List.Item header='Draft:' content={boat.draft+' ft'} />
            </List>
        </Tab.Pane>
    );
}

const Engine = ({boat}) => {
    return (
        <Tab.Pane>
            <List>
                <List.Item header='Engine make:' content={boat.engine_make} />
                <List.Item header='Engine power:' content={boat.engine_power} />
                <List.Item header='Engine date:' content={boat.engine_date} />
                <List.Item header='Engine fuel:' content={boat.engine_fuel} />
                <List.Item header='Previous engine(s):' content={boat.previous_engine} />
                <List.Item header='Propeller blades:' content={boat.propellor_blades} />
                <List.Item header='Propeller type:' content={boat.propellor_type} />
                <List.Item header='Propeller position:' content={boat.propellor_position} />
            </List>
        </Tab.Pane>
    );
}

const Boat = ({id}) => {

    const { loading, error, data } = useQuery(boatQuery(id));

    useEffect(() => {
        if(data) {
            document.title = data.boat.name;
        }
      });

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    const boat = data.boat;


    const panes = [
        { menuItem: 'Full Description', render: () => <Tab.Pane dangerouslySetInnerHTML={{__html: boat.full_desc}}/>},
        { menuItem: 'Registration and location', render: () => <RegistrationAndLocation boat={boat}/> },
        { menuItem: 'Rig and Sails', render: () => <RigAndSails id={id}/> },
        { menuItem: 'Construction', render: () => <Construction boat={boat}/> },
        { menuItem: 'Hull', render: () => <Hull boat={boat}/> },
        { menuItem: 'Engine', render: () => <Engine boat={boat.propulsion}/> },
      ];    

    return (
        <Container>
            <TopMenu/>
            <Grid columns={2} divided>
                <Grid.Row>
                    <Grid.Column width={10}>
                        <Header as="h1">{boat.name}</Header>
                    </Grid.Column>
                    <Grid.Column width={1}>
                        <Header as="h1">{boat.year}</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={10}>
                     <ImageCarousel images={boat.images}/>
                    </Grid.Column>
                    <Grid.Column width={3}>
                        <Header as="h2">Details</Header>
                        <List>
                            <List.Item header='Boat OGA no:' content={id}/>
                            <List.Item header='Mainsail type:' content={boat.class.mainsailType}/>
                            <List.Item header='Rig type:' content={boat.class.rigType}/>
                            <List.Item header='Home port or other location:' content={boat.home_port}/>
                        </List> 
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Image.Group size='tiny'><ImageList images={boat.images}/></Image.Group>
            <Tab panes={panes}/>
        </Container>
    );
};

export default Boat;