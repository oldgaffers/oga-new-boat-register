import React from 'react';
import { Button, Dropdown, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import SearchPeople from './SearchPeople'
import SearchBoatNames from './SearchBoatNames';

// Set the 'do not filter' option - the other values will be filled from the database
const rigTypeOptions = [{ key: '', text: '- Any -', value: '- Any -' }];
const mainSailOptions = [{ key: '', text: '- Any -', value: '- Any -' }];
const genericTypeOptions = [{ key: '', text: '- Any -', value: '- Any -' }];
const designClassOptions = [{ key: '', text: '- Any -', value: '- Any -' }];
const materialOptions = [{ key: '', text: '- Any -', value: '- Any -' }];

// prefix the value with ! to flip the meaning of reverse
// (this is processed in Boats.js)
const sortOptions = [
    { key: 'name', text: 'Boat Name', value: 'name' },
    { key: 'oga_no', text: 'OGA Boat No.', value: 'oga_no' },
    { key: 'built', text: 'Year Built', value: 'built' },
    { key: 'updated', text: 'Last Updated', value: '!updated' }
];

const pageOptions = [];
for (let i = 6; i <= 48; i += 6) {
    pageOptions.push({ key: i, text: `${i}`, value: i });
};

const SearchAndFilterBoats = ({onReset, onSearch, onUpdate, onPageSize, filters}) => {

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

    const searchClicked = (e) => {
        if(onSearch) onSearch(filters);
    }

    const resetClicked = () => {
        if(onReset) onReset();
    }

    const pageSizeChanged = (size) => {
        if(onPageSize) onPageSize(size);
    }

    const filterChanged = (field,value) => {
        let newFilters = {...filters};
        if(value === '- Any -') {
            delete newFilters[field];
        } else {
            newFilters[field] = value;
        }
        if(onUpdate) onUpdate(newFilters);
    }

    console.log('filters', filters);

    return (
        <Form onSubmit={searchClicked}>
            <Form.Group inline>
                <SearchBoatNames onChange={value=>filterChanged('name',value)}
                    label='Boat Name (incl. previous names)'
                    defaultValue={filters.name}
                />
                <Form.Input size='mini' label='OGA Boat No.' type='text'
                    onChange={(_,{value})=>filterChanged('oga_no',value)} 
                    defaultValue={filters.oga_no}
                />
                <Form.Field>
                    <label>Rig Type</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('rigType',value)} 
                        defaultValue={rigTypeOptions[0].value}
                        selection options={rigTypeOptions}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Mainsail Type</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('sailType',value)}
                        defaultValue={mainSailOptions[0].value}
                        selection options={mainSailOptions}
                    />
                </Form.Field>
                <Form.Group inline>
                    <label>Year Built</label>
                    <Form.Input onChange={(_,{value})=>filterChanged('minYear',value)} defaultValue='1850' label='between' type='text' />
                    <Form.Input onChange={(_,{value})=>filterChanged('maxYear',value)} defaultValue='2020' label='and' type='text' />
                </Form.Group>
            </Form.Group>
            <Form.Group inline>
                <SearchPeople onChange={value=>filterChanged('designer',value)} label='Designers Name' field='designers'/>
                <SearchPeople onChange={value=>filterChanged('builder',value)} label='Builders Name' field='builders'/>
                <Form.Field>
                    <label>Design Class</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('designClass',value)} defaultValue={designClassOptions[0].value} selection options={designClassOptions} />
                </Form.Field>
                <Form.Field>
                    <label>Generic Type</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('genericType',value)} defaultValue={genericTypeOptions[0].value} selection options={genericTypeOptions} />
                </Form.Field>
                <Form.Field>
                    <label>Construction material</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('constructionMaterial',value)} defaultValue={materialOptions[0].value} selection options={materialOptions} />
                </Form.Field>
            </Form.Group>
            <Form.Group inline>
                <Form.Radio onChange={(_,{checked})=>filterChanged('has_images',!checked)} toggle label='include boats without pictures' />
                <Form.Radio onChange={(_,{checked})=>filterChanged('for_sale',checked)} toggle label='only boats for sale' />
            </Form.Group>
            <Form.Group inline>
                <Form.Field>
                    <label>Sort By</label>
                    <Dropdown onChange={(_,{value})=>filterChanged('sortBy',value)} defaultValue={sortOptions[0].value} selection options={sortOptions} />
                </Form.Field>
                <Form.Radio onChange={(_,{checked})=>filterChanged('reverse',checked)} toggle label='reversed' />
                <Form.Field>
                    <label>Boats Per Page</label>
                    <Dropdown onChange={(_,{value})=>pageSizeChanged(value)} defaultValue={pageOptions[1].value} selection options={pageOptions} />
                </Form.Field>
                <Button onClick={resetClicked} type='reset'>Reset</Button>
            </Form.Group>
        </Form>
    )
}
export default SearchAndFilterBoats