
const ListItems = ({ boat, labels }) => {
    let i = 0;
    const l = [];
    Object.keys(boat).forEach(key => {
        if (boat[key] && labels[key]) {
            if (labels[key].label) {
                let text = boat[key];
                if (labels[key].unit) text = `${text} ${labels[key].unit}`
                l.push((<List.Item key={i++} header={labels[key].label} content={text} />));
            } else {
                const nlabels = labels[key];
                const f = boat[key];
                Object.keys(boat[key]).forEach(key => {
                    if (f[key] && nlabels[key]) {
                        let text = f[key];
                        if (nlabels[key].unit) text = `${text} ${nlabels[key].unit}`
                        l.push((<List.Item key={i++} header={nlabels[key].label} content={text} />));
                    }
                });
            }
        }
    });
    return l;
}
module.exports = { ListItems }