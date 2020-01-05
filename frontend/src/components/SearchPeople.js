import React, { useState } from 'react';
import { Form, Search } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import _ from 'lodash'

const SearchPeople = ({onChange, field, label, value}) => {

    const [results,setResults] = useState([]);

    const { loading, error, data } = useQuery(gql`{${field}{id name}}`);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    const choices = data[field];
    
    const handleResultSelect = (e, { result }) => {
        if(onChange) onChange(result.title);
    };
    
    const handleSearchChange = (e, { value }) => {
        const re = new RegExp(value, 'i');
        const res = choices.filter(obj => Object.values(obj).some(val => val.match(re)));
        setResults(res.map(({name}) => { return {title:name}}));
    };

    return (
        <Form.Field><label>{label}</label>
        <Search
        onResultSelect={handleResultSelect}
        minCharacters={3}
        onSearchChange={_.debounce(handleSearchChange, 500, {
        leading: true,
        })}
        results={results}
        defaultValue={value?value:''}
        />
        </Form.Field>
    );
}
export default SearchPeople