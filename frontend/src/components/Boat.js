import React, { useEffect } from 'react';
import { Container, Grid, Header, Image, List, Tab, ListItem } from 'semantic-ui-react';
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
        approximate_year_of_build
        place_built
        home_country
        home_port
        sail_no
        ssr_no
        nhsr_no
        fishing_no
        call_sign
        other_registries
        nsbr_no
        off_reg_no
        port_reg
        short_desc
        full_desc
        sale_text
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

const registration = {
    prev_name: { label:'Previous name/s'},
    place_built: {label:'Place built' },
    year: {label:'Year of Build'},
    approximate_year_of_build:{label:'Approximate Year of Build'},
    sail_no:{label:'Sail No.'},
    home_country:{label:'Home Country'},
    ssr_no:{label:'Small Ships Registry no. (SSR)'},
    nhsr_no:{label:'National Register of Historic Vessels no. (NRHV)'},
    fishing_no:{label:'Fishing No.'},
    call_sign:{label:'Call Sign'},
    other_registries:{label:'Other Registrations'},
    nsbr_no:{label:'National Small Boat Register'},
    off_reg_no:{label:'Official Registration'},
    port_reg:{label:'Port of Registry'}
};

const construction = {
    construction_method:{label:'Construction method'},
    construction_material:{label:'Construction material'},
    class:{ 
        hullType:{label:'Hull Type'},
        genericType:{label:'Generic Type '},
    },
    builder:{name:{label:'Builder'}}
};

const hull = {
    length_overall:{label:'Length on deck (LOD):', unit:'ft'},
    length_on_waterline:{label:'Length on waterline (LWL):', unit:'ft'},
    beam:{label:'Beam', unit:'ft'},
    draft:{label:'Draft', unit:'ft'}
};

const engine = {
    engine_make:{label:'Engine make:'},
    engine_power:{label:'Engine power:'},
    engine_date:{label:'Engine date:'},
    engine_fuel:{label:'Engine fuel:'},
    previous_engine:{label:'Previous engine(s):'},
    propellor_blades:{label:'Propeller blades:'},
    propellor_type:{label:'Propeller type:'},
    propellor_position:{label:'Propeller position:'}
};

const TextTab = ({boat, labels}) => {
    let i=0;
    const l = [];
    Object.keys(boat).forEach(key => {
        if(boat[key] && labels[key]) {
            if(labels[key].label) {
                let text = boat[key];
                if(labels[key].unit) text = `${text} ${labels[key].unit}`
                l.push((<List.Item key={i++} header={labels[key].label} content={text} />));
            } else {
                const nlabels = labels[key];
                const f = boat[key];
                Object.keys(boat[key]).forEach(key => {
                    if(f[key] && nlabels[key]) {
                        let text = f[key];
                        if(nlabels[key].unit) text = `${text} ${nlabels[key].unit}`
                        l.push((<List.Item key={i++} header={nlabels[key].label} content={text} />));
                    }
                });
            }
        }
    });
    return (<Tab.Pane><List>{l}</List></Tab.Pane>);
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

    let full_description = boat.full_desc;
    if(boat.sale_text) {
        full_description += `<h3>Sales Info</h3>${boat.sale_text}'</p>`;
    }

    const panes = [
        { menuItem: 'Full Description', render: () => <Tab.Pane dangerouslySetInnerHTML={{__html: full_description}}/>},
        { menuItem: 'Registration and location', render: () => <TextTab labels={registration} boat={boat}/> },
        { menuItem: 'Rig and Sails', render: () => <RigAndSails id={id}/> },
        { menuItem: 'Construction', render: () => <TextTab labels={construction} boat={boat}/> },
        { menuItem: 'Hull', render: () => <TextTab labels={hull} boat={boat}/> },
        { menuItem: 'Engine', render: () => <TextTab labels={engine} boat={boat.propulsion}/> },
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
                            <ListItem><div dangerouslySetInnerHTML={{__html: boat.short_desc}}></div></ListItem>
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