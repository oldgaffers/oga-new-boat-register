import React, { useState } from 'react';
import { Form, Search } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import _ from 'lodash'

const SearchBoatNames = ({onChange, label, defaultValue}) => {

    const [results,setResults] = useState([]);

    const { loading, error, data } = useQuery(gql`{boatNames}`);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    const choices = data.boatNames;

    const handleResultSelect = (e, { result }) => {
        if(onChange) onChange(result.title);
    };
    
    const handleSearchChange = (e, { value }) => {
        const re = new RegExp(value, 'i');
        const res = choices.filter(val => val.match(re));
        if(res.length<32) {
            const r = res.map(name => { return {title:name}});
            setResults(r);
        }
    };

    return (
        <Form.Field><label>{label}</label>
        <Search
            onResultSelect={handleResultSelect}
            onSearchChange={_.debounce(handleSearchChange, 500, {leading: true,})}
            results={results}
            defaultValue={defaultValue}
        />
        </Form.Field>
    );
}
export default SearchBoatNames