import React from 'react';
import { List, Tab, Container } from 'semantic-ui-react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const handicapQuery = (id) => gql`{
    handicap(id:${id}) {
        oga_no
        calculated_thcf
        sailarea
        fore_triangle_height
        fore_triangle_base
        no_head_sails
        main{ luff head foot }
        mizzen{ luff foot }
        topsail{ luff perpendicular }
    }
}`;

const RigAndSails = ({id}) => {
    const { loading, error, data } = useQuery(handicapQuery(id));
    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    const handicap = data.handicap
    const format = {
        sailarea: {header:'Sail area:', unit: 'sq ft'},
        fore_triangle_height: {header:'Fore triangle height (I):', unit: ' ft'},
        fore_triangle_base: {header:'Fore triangle base (J):', unit: 'ft'},
        calculated_thcf: { header:'Calculated T(H)CF:', unit: ''},
        main_head: {header:'Mainsail head (G):', unit: 'ft'},
        main_luff: {header:'Mainsail luff (H):', unit: 'ft'},
        main_foot: {header:'Mainsail foot (F):', unit: 'ft'},
        mizzen_luff: {header:'Mizzen luff (H)', unit: 'ft'},
        mizzen_foot: {header:'Mizzen foot (B)', unit: 'ft'},
        topsail_perpendicular: {header:'Topsail perpendicular (TI):', unit: 'ft'},
        topsail_luff: {header:'Topsail luff (TH):', unit: 'ft'}
    }
    const items = [];
    if(handicap.sailarea) items.push({ ...format.sailarea, value: handicap.sailarea });
    if(handicap.fore_triangle_height) items.push({ ...format.fore_triangle_height, value: handicap.fore_triangle_height });
    if(handicap.fore_triangle_base) items.push({ ...format.fore_triangle_base, value: handicap.fore_triangle_base });
    if(handicap.main) {
        if(handicap.main.head) items.push({ ...format.main_head, value: handicap.main.head });
        if(handicap.main.luff) items.push({ ...format.main_luff, value: handicap.main.luff });
        if(handicap.main.foor) items.push({ ...format.main_foot, value: handicap.main.foot });
    }
    if(handicap.mizzen) {
        if(handicap.mizzen.luff) items.push({ ...format.mizzen_luff, value: handicap.mizzen.luff });
        if(handicap.mizzen.foor) items.push({ ...format.mizzen_foot, value: handicap.mizzen.foot });
    }
    if(handicap.topsail) {
        if(handicap.topsail.luff) items.push({ ...format.topsail_luff, value: handicap.topsail.luff });
        if(handicap.topsail.perpendicular) items.push({ ...format.topsail_perpendicular, value: handicap.topsail.perpendicular });
    }
    if(handicap.calculated_thcf) items.push({ ...format.calculated_thcf, value: handicap.calculated_thcf });

    return (
        <Tab.Pane>
            <List>{items.map(i => <List.Item header={i.header} content={`${i.value} ${i.unit}`} />)}</List>
        </Tab.Pane>
    );
}

export default RigAndSails