import React from 'react';
import { List, Tab } from 'semantic-ui-react';
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

    return (
        <Tab.Pane>
            <List>
                <List.Item header='Sail area:' content={handicap.sailarea+' sq ft'} />
                <List.Item header='Fore triangle height (I):' content={handicap.fore_triangle_height+' ft'} />
                <List.Item header='Fore triangle base (J):' content={handicap.fore_triangle_base+' ft'} />
                <List.Item header='Mainsail head (G):' content={handicap.main.head+' ft'} />
                <List.Item header='Mainsail luff (H):' content={handicap.main.luff+' ft'} />
                <List.Item header='Mainsail foot (F):' content={handicap.main.foot+' ft'} />
                <List.Item header='Mizzen luff (H):' content={handicap.mizzen.luff+' ft'} />
                <List.Item header='Mizzen foot (B):' content={handicap.mizzen.foot+' ft'} />
                <List.Item header='Topsail perpendicular (TI):' content={handicap.topsail.perpendicular+' ft'} />
                <List.Item header='Topsail luff (TH):' content={handicap.topsail.luff+' ft'} />
                <List.Item header='Calculated T(H)CF:' content={handicap.calculated_thcf} />
            </List>
        </Tab.Pane>
    );
}

export default RigAndSails