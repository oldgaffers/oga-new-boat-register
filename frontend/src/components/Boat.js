import React, { useEffect } from 'react';
import { Responsive, Container, Grid, Header, List, Tab, ListItem } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import TopMenu from './TopMenu';
import Friendly from './Friendly.js';
import RigAndSails from './RigAndSails';
import ImageCarousel from './ImageCarousel';
import ListItems from "./boat-utils";

const boatQuery = (id) => gql`{
    boat(id:${id}) {
        name prev_name
        year approximate_year_of_build
        place_built home_country home_port
        sail_no ssr_no nhsr_no fishing_no call_sign
        other_registries nsbr_no off_reg_no port_reg
        short_desc full_desc
        for_sale sale_text price
        images{
            uri
            copyright
            height width title alt
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

const registration = {
    prev_name: { label: 'Previous name/s' },
    place_built: { label: 'Place built' },
    year: { label: 'Year of Build' },
    approximate_year_of_build: { label: 'Approximate Year of Build' },
    sail_no: { label: 'Sail No.' },
    home_country: { label: 'Home Country' },
    ssr_no: { label: 'Small Ships Registry no. (SSR)' },
    nhsr_no: { label: 'National Register of Historic Vessels no. (NRHV)' },
    fishing_no: { label: 'Fishing No.' },
    call_sign: { label: 'Call Sign' },
    other_registries: { label: 'Other Registrations' },
    nsbr_no: { label: 'National Small Boat Register' },
    off_reg_no: { label: 'Official Registration' },
    port_reg: { label: 'Port of Registry' }
};

const construction = {
    construction_method: { label: 'Construction method' },
    construction_material: { label: 'Construction material' },
    class: {
        hullType: { label: 'Hull Type' },
        genericType: { label: 'Generic Type ' },
    },
    builder: { name: { label: 'Builder' } }
};

const hull = {
    length_overall: { label: 'Length on deck (LOD):', unit: 'ft' },
    length_on_waterline: { label: 'Length on waterline (LWL):', unit: 'ft' },
    beam: { label: 'Beam', unit: 'ft' },
    draft: { label: 'Draft', unit: 'ft' }
};

const engine = {
    engine_make: { label: 'Engine make:' },
    engine_power: { label: 'Engine power:' },
    engine_date: { label: 'Engine date:' },
    engine_fuel: { label: 'Engine fuel:' },
    previous_engine: { label: 'Previous engine(s):' },
    propellor_blades: { label: 'Propeller blades:' },
    propellor_type: { label: 'Propeller type:' },
    propellor_position: { label: 'Propeller position:' }
};

const Boat = ({ id }) => {

    const { loading, error, data } = useQuery(boatQuery(id));

    useEffect(() => {
        if (data) {
            document.title = data.boat.name;
        }
    });

    const rigItems = RigAndSails({ id }); // uses hooks so must be unconditional

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    const boat = data.boat;

    const panes = [
        { menuItem: 'Registration and location', render: () => <Tab.Pane><List><ListItems labels={registration} boat={boat} /></List></Tab.Pane> },
        { menuItem: 'Construction', render: () => <Tab.Pane><List><ListItems labels={construction} boat={boat} /></List></Tab.Pane> },
        { menuItem: 'Hull', render: () => <Tab.Pane><List><ListItems labels={hull} boat={boat} /></List></Tab.Pane> },
    ];
    if (rigItems.length > 0) {
        panes.push({ menuItem: 'Rig and Sails', render: () => <Tab.Pane><List>{rigItems}</List></Tab.Pane> });
    }
    const engineItems = ListItems({ labels: engine, boat: boat.propulsion });
    if (engineItems.length > 0) {
        panes.push({ menuItem: 'Engine', render: () => <Tab.Pane><List>{engineItems}</List></Tab.Pane> });
    }

    if (boat.full_desc) {
        panes.unshift(
            { menuItem: 'Full Description', render: () => <Tab.Pane dangerouslySetInnerHTML={{ __html: boat.full_desc }} /> },
        );
    }

    if (boat.for_sale) {
        let text = boat.sale_text;
        if (boat.price) {
            text += "<b>Price: </b>" + boat.price;
        }
        panes.unshift({
            menuItem: 'For Sale', render: () => <Tab.Pane dangerouslySetInnerHTML={{ __html: text }} />
        });
    }

    return (
        <Responsive>
            <TopMenu />
            <Container>
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
                        <Grid.Column width={13}>
                            <div dangerouslySetInnerHTML={{ __html: '<iframe src="https://juliancable.smugmug.com/frame/slideshow?key=smhdQr&autoStart=1&captions=1&navigation=1&playButton=1&randomize=1&speed=3&transition=fade&transitionSpeed=2" width="800" height="600" frameborder="no" scrolling="no"></iframe>' }}></div>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Header as="h2">Details</Header>
                            <List>
                                <List.Item header='Boat OGA no:' content={id} />
                                <List.Item header='Mainsail type:' content={boat.class.mainsailType} />
                                <List.Item header='Rig type:' content={boat.class.rigType} />
                                <List.Item header='Home port or other location:' content={boat.home_port} />
                                <ListItem><div dangerouslySetInnerHTML={{ __html: boat.short_desc }}></div></ListItem>
                            </List>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row width={16}>
                        <Tab panes={panes} />
                    </Grid.Row>
                </Grid>
            </Container>
            <Friendly />
        </Responsive>

    );
};

export default Boat;