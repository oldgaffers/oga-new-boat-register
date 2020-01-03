import React from "react"
import { List, Card } from 'semantic-ui-react';

export const CardItems = ({ boat, labels }) => {
    return anyItems(boat, labels, (key, label, text)=>{
        return (<Card.Meta  key={key}><strong>{label}: </strong>{text}</Card.Meta>);
    });
}

export const ListItems = ({ boat, labels }) => {
    return anyItems(boat, labels, (key, label, text)=>{
        return (<List.Item key={key} header={label} content={text}/>);
    });
}

const anyItems = (boat, labels, render) => {
    const l=[];
    anyItemsR(l, 0, boat, labels, render);
    return l;
}

const anyItemsR = (l, i, boat, labels, render) => {
    Object.keys(boat).forEach(key => {
        if (boat[key] && labels[key]) {
            if (typeof boat[key] === 'object') {
                i = anyItemsR(l, i, boat[key], labels[key], render);
            } else {
                let text = boat[key];
                if (labels[key].unit) text = `${text} ${labels[key].unit}`
                const r = render(i++, labels[key].label, text);
                console.log(r);
                l.push(r);
            }
        }
    });
    return i;
}

export default ListItems