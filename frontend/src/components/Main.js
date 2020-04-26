import React from 'react';
import { Dropdown, Form } from 'semantic-ui-react';

function Main() {
    return (
    <div>
        <Form>
            <Dropdown
            placeholder='Select Friend'
    fluid
    selection
    options={[
        {key: 1, text: 'a', value: 'A'},
        {key: 2, text: 'b', value: 'B'},
        {key: 3, text: 'c', value: 'C'},
    ]}            />
                
        </Form>

    </div>); // TODO iframe with browse inside
}

export default Main