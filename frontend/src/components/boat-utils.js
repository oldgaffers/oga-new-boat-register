import React from "react"
import { List, Card } from 'semantic-ui-react';

export const CardItems = ({ boat, labels }) => {
    return anyItems(boat, labels, (key, label, text)=>{
        return (<Card.Meta key={key}><strong>{label}</strong> {text}</Card.Meta>);
    });
}

export const ListItems = ({ boat, labels }) => {
    return anyItems(boat, labels, (key, label, text)=>{
        return (<List.Item key={key} header={label} content={text}/>);
    });
}

const anyItems = (boat, labels, render) => {
    let i = 0;
    const l = [];
    Object.keys(boat).forEach(key => {
        if (boat[key] && labels[key]) {
            if (labels[key].label) {
                let text = boat[key];
                if (labels[key].unit) text = `${text} ${labels[key].unit}`
                l.push(render(i++, labels[key].label, text));
            } else {
                const nlabels = labels[key];
                const f = boat[key];
                Object.keys(boat[key]).forEach(key => {
                    if (f[key] && nlabels[key]) {
                        let text = f[key];
                        if (nlabels[key].unit) text = `${text} ${nlabels[key].unit}`
                        l.push(render(i++, nlabels[key].label, text));
                    }
                });
            }
        }
    });
    return l;
}

export default ListItems