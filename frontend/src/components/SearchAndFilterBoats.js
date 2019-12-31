import React from 'react';
import { Button, Dropdown, Form, Radio, Search } from 'semantic-ui-react';

const rigTypeOptions = [
    {key:'', text:'- Any -', value: '- Any -'},
    {key:'Cutter', text:'Cutter', value:'Cutter'},
    {key:'Ketch', text:'Ketch', value:'Ketch'},
    {key:'Sloop', text:'Sloop', value:'Sloop'},
    {key:'Yawl', text:'Yawl', value:'Yawl'}
];
const mainSailOptions = [
    {key:'', text:'- Any -', value: '- Any -'},
    {key:'Gaff', text:'Gaff', value:'Gaff'},
];
const genericTypeOptions = [
    {key:'', text:'- Any -', value: '- Any -'},
    {key:'Yacht', text:'Yacht', value:'Yacht'},
];
const designClassOptions = [
    {key:'', text:'- Any -', value: '- Any -'},
    {key:'Hurd 28', text:'Hurd 28', value:'Hurd 28'},
];
const materialOptions = [
    {key:'', text:'- Any -', value: '- Any -'},
    {key:'wood', text:'wood', value:'wood'},
];

const sortOptions = [
    {key:'name', text:'Boat Name', value:'name'},
    {key:'built', text:'Year Built', value:'built'},
    {key:'updated', text:'last updated', value:'updated'}
];
const pageOptions = [];

const SearchAndFilterBoats = () => {
    for(let i=6; i<=48; i+=6) {
        pageOptions.push({key:i, text:`${i}`, value:i});
    }
    return (
<Form>
    <Form.Group inline>
        <Form.Field>
            <label>Boat Name</label>
            <Search/>
        </Form.Field>
        <Form.Input size='mini' label='OGA Boat No.' type='text' />
        <Form.Field>
            <label>Rig Type</label>
            <Dropdown defaultValue={rigTypeOptions[0].value} selection options={rigTypeOptions} />
        </Form.Field>
        <Form.Field>
            <label>Mainsail Type</label>
            <Dropdown defaultValue={mainSailOptions[0].value} selection options={mainSailOptions} />
        </Form.Field>
        <Form.Group inline>
            <label>Year Built</label>
            <Form.Input defaultValue='1850' size='mini' label='between' type='text' />
            <Form.Input defaultValue='2020' size='mini' label='and' type='text' />        
        </Form.Group>
    </Form.Group>
    <Form.Group inline>
        <Form.Field><label>Previous name/s</label><Search/></Form.Field>
        <Form.Field><label>Designer name</label><Search/></Form.Field>
        <Form.Field><label>Builder name</label><Search/></Form.Field>
        <Form.Field>
            <label>Design Class</label>
            <Dropdown defaultValue={designClassOptions[0].value} selection options={designClassOptions} />
        </Form.Field>
        <Form.Field>
            <label>Generic Type</label>
            <Dropdown defaultValue={genericTypeOptions[0].value} selection options={genericTypeOptions} />
        </Form.Field>
        <Form.Field>
            <label>Construction material</label>
            <Dropdown defaultValue={materialOptions[0].value} selection options={materialOptions} />
        </Form.Field>
    </Form.Group>
    <Form.Group inline>
        <Form.Field>
            <label>Sort By</label>
            <Dropdown defaultValue={sortOptions[0].value} selection options={sortOptions} />
        </Form.Field>
        <Form.Radio toggle label='reversed'/>
        <Form.Field>
            <label>Boats Per Page</label>
            <Dropdown defaultValue={pageOptions[1].value} selection options={pageOptions} />
        </Form.Field>
        <Button type='submit'>Search</Button>
        <Button type='reset'>Reset</Button>
    </Form.Group>
  </Form>        
    )
}
export default SearchAndFilterBoats