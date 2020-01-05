import React, { useState } from 'react';
import { Form, Search } from 'semantic-ui-react';
import _ from 'lodash'

const SearchPeopleAndBoats = ({onSearchChange, onResultSelect, choices, label, value}) => {

    const [results,setResults] = useState([]);

    const handleResultSelect = (_, { result }) => {
        console.log('handleResultSelect', result);
        if(onResultSelect) onResultSelect(result.title);
    };

    const handleSearchChange = (_, { value }) => {
        const re = new RegExp(value, 'i');
        const res = choices.filter(obj => Object.values(obj).some(val => val.match(re)));
        setResults(res.map(({name}) => { return {title:name}}));
        if(onSearchChange) onSearchChange(value);
    };

    return (
        <Form.Field><label>{label}</label>
        <Search
        onResultSelect={(e,r) => handleResultSelect(e,r)}
        minCharacters={3}
        onSearchChange={_.debounce(handleSearchChange, 500, {
        leading: true,
        })}
        results={results}
        value={value}
        />
        </Form.Field>
    );
}
export default SearchPeopleAndBoats