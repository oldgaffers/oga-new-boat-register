import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import SearchPeopleAndBoats from './SearchPeopleAndBoats'

const ANY = '- Any -';

// Set the 'do not filter' option - the other values will be filled from the database
const rigTypeOptions = [{ key: '', text: ANY, value: ANY }];
const mainSailOptions = [{ key: '', text: ANY, value: ANY }];
const genericTypeOptions = [{ key: '', text: ANY, value: ANY }];
const designClassOptions = [{ key: '', text: ANY, value: ANY }];
const materialOptions = [{ key: '', text: ANY, value: ANY }];

const sortOptions = [
    { key: 'name', text: 'Boat Name', value: 'name' },
    { key: 'oga_no', text: 'OGA Boat No.', value: 'oga_no' },
    { key: 'built', text: 'Year Built', value: 'built' },
    { key: 'updated', text: 'Last Updated', value: 'updated' }
];

const pageOptions = [];
for (let i = 6; i <= 48; i += 6) {
    pageOptions.push({ key: i, text: `${i}`, value: i });
};

const SearchBoatNames = ({onChange, onSearchChange, value}) => {

    const { loading, error, data } = useQuery(gql`{boatNames}`);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;

    const choices = data.boatNames.map(name => { return {name:name}});

    return (<SearchPeopleAndBoats
        onResultSelect={onChange}
        onSearchChange={onSearchChange}
        choices={choices}
        label="Boat Name (incl. previous names)"
        value={value}
    />);
}

const SearchBuilders = ({onChange, onSearchChange, value}) => {

    const { loading, error, data } = useQuery(gql`{builders{id name}}`);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;

    return (<SearchPeopleAndBoats 
        onResultSelect={onChange}
        onSearchChange={onSearchChange}
        choices={data.builders}
        label="Builders Name"
        value={value}
    />);
}

const SearchDesigners = ({onChange, onSearchChange, value}) => {

    const { loading, error, data } = useQuery(gql`{designers{id name}}`);

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;

    return (<SearchPeopleAndBoats 
        onResultSelect={onChange}
        onSearchChange={onSearchChange}
        choices={data.designers}
        label="Designers Name"
        value={value}
    />);
}

const SearchAndFilterBoats = ({onReset, onUpdate, onPageSize, boatsPerPage, filters}) => {
    
    const [reverse, setReverse] = useState(false);
    const [builder, setBuilder] = useState('');
    const [designer, setDesigner] = useState('');
    const [boatName, setBoatName] = useState('');

    const { loading, error, data } = useQuery(gql(`{picLists{
        rigTypes
        sailTypes
        classNames
        genericTypes
        constructionMaterials        
    }}`));

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(TBD)</p>;
    if (rigTypeOptions.length <= 1) {
        data.picLists.rigTypes.forEach(v => rigTypeOptions.push({ key: v, text: v, value: v }));
        data.picLists.sailTypes.forEach(v => mainSailOptions.push({ key: v, text: v, value: v }));
        data.picLists.classNames.forEach(v => designClassOptions.push({ key: v, text: v, value: v }));
        data.picLists.genericTypes.forEach(v => genericTypeOptions.push({ key: v, text: v, value: v }));
        data.picLists.constructionMaterials.forEach(v => materialOptions.push({ key: v, text: v, value: v }));
    }

    const pageSizeChanged = (size) => {
        if(onPageSize) onPageSize(size);
    }

    const handleReset = () => {
        if(onReset) onReset();
        setBuilder('');
        setDesigner('')
        setBoatName('');
    }

    const filterChanged = (field,value) => {

        let newFilters = {...filters};

        console.log('filterChanged',field, value, reverse);
        if(field === 'sortBy') {
            // also set sort direction
            newFilters.reverse = (value === 'updated')?(!reverse):reverse;
        }
        console.log('filterChanged to',newFilters);

        if(field === 'reverse') {
            setReverse(value);
        }

        if(field === 'builder') {
            setBuilder(value);
        }

        if(field === 'designer') {
            setDesigner(value);
        }

        if(field === 'name') {
            setBoatName(value);
        }

        if(value === ANY) {
            newFilters[field] = null;
        } else {
            newFilters[field] = value;
        }
        if(onUpdate) onUpdate(newFilters);
    }

    console.log('filters', filters);

    return (
        <Form>
            <Form.Group inline>
                <SearchBoatNames 
                    onChange={value=>filterChanged('name',value)}
                    onSearchChange={(value) => setBoatName(value)}
                    value={boatName}
                />
                <Form.Input size='mini' label='OGA Boat No.' type='text'
                    onChange={(_,{value})=>filterChanged('oga_no',value)} 
                    value={filters.oga_no?filters.oga_no:''}
                />
                <SearchDesigners 
                    onChange={value=>filterChanged('designer',value)} 
                    onSearchChange={(value) => setDesigner(value)}
                    value={designer}
                />
                <SearchBuilders
                    onChange={value=>filterChanged('builder',value)}
                    onSearchChange={(value) => setBuilder(value)}
                    value={builder}
                />
                <Form.Group inline>
                    <label>Year Built</label>
                    <Form.Input onChange={(_,{value})=>filterChanged('minYear',value)} value={filters.minYear} label='between' type='text' />
                    <Form.Input onChange={(_,{value})=>filterChanged('maxYear',value)} value={filters.maxYear} label='and' type='text' />
                </Form.Group>
            </Form.Group>
            <Form.Group inline>
            <Form.Field>
                    <label>Rig Type</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('rigType',value)} 
                        value={filters.rigType?filters.rigType:ANY}
                        selection options={rigTypeOptions}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Mainsail Type</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('sailType',value)}
                        value={filters.sailType?filters.sailType:ANY}
                        selection options={mainSailOptions}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Design Class</label>
                    <Dropdown search selection
                        onChange={(_,{value})=>filterChanged('designClass',value)} 
                        value={filters.designClass?filters.designClass:ANY} 
                        options={designClassOptions} />
                </Form.Field>
                <Form.Field>
                    <label>Generic Type</label>
                    <Dropdown selection onChange={(_,{value})=>filterChanged('genericType',value)}
                        value={filters.genericType?filters.genericType:ANY}  
                        options={genericTypeOptions}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Construction material</label>
                    <Dropdown selection onChange={(_,{value})=>filterChanged('constructionMaterial',value)}
                        value={filters.constructionMaterial?filters.constructionMaterial:ANY}
                        options={materialOptions}
                    />
                </Form.Field>
            </Form.Group>
            <Form.Group inline>
                <Form.Radio onChange={(_,{checked})=>filterChanged('has_images',checked?null:true)} toggle label='include boats without pictures' />
                <Form.Radio onChange={(_,{checked})=>filterChanged('for_sale',checked)} toggle label='only boats for sale' />
            </Form.Group>
            <Form.Group inline>
                <Form.Field>
                    <label>Sort By</label>
                    <Dropdown selection onChange={(_,{value})=>filterChanged('sortBy',value)}
                        value={filters.sortBy} options={sortOptions}
                    />
                </Form.Field>
                <Form.Radio onChange={(_,{checked})=>filterChanged('reverse',checked)} toggle label='reversed' />
                <Form.Field>
                    <label>Boats Per Page</label>
                    <Dropdown selection onChange={(_,{value})=>pageSizeChanged(value)}
                        value={boatsPerPage}
                        options={pageOptions} />
                </Form.Field>
                <Button onClick={()=>handleReset()} type='reset'>Reset</Button>
            </Form.Group>
        </Form>
    )
}
export default SearchAndFilterBoats