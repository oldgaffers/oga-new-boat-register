const axios = require('axios')
const fs = require('fs')

const api_key = fs.readFileSync('../jot_api_key.txt')

function compare(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

async function getNamed(field) {
    const url = 'https://oga-boats.herokuapp.com/'
    const r = await axios.post(url, { query: `query{${field}{name}}`})
    return r.data.data[field].map(a => a.name).filter(a => a != '')
}

async function getSimple(field) {
    url = 'https://oga-boats.herokuapp.com/'
    const r = await axios.post(url, { query: `query{${field}}`})
    return r.data.data[field]
}

async function updateQuestion(form, question, field, newValues) {
    const newValue = newValues.sort(compare).join('|')
    if(question[field] === newValue) {
      console.log('no change', question.name)
      return;
    }
    data = `question[${field}]=${encodeURIComponent(newValue)}`
    console.log(data)
    return axios.post(`http://eu-api.jotform.com/form/${form}/question/${question.qid}?apikey=${api_key}`,
       data,
       { 'Content-Type': 'application/x-www-form-urlencoded' }
    )
}

async function main(form_id) {
    const r = await axios.get(`https://eu-api.jotform.com/form/${form_id}/questions?apikey=${api_key}`)
    questions = r.data.content
    for(qid of Object.keys(questions)) {
        const question = questions[qid]
        let r
        switch(question.name) {
        case 'builder':
            r = await updateQuestion(form_id, question, 'items', await getNamed('builders'))
            break;
        case 'designer':
            r = await updateQuestion(form_id, question, 'items', await getNamed('designers'))
            break;
        case 'className':
            r = await updateQuestion(form_id, question, 'items', await getSimple('classNames'))
            break;
        case 'genericType':
            r = await updateQuestion(form_id, question, 'items', await getSimple('genericTypes'))
            break;
        default: // do nothing
        }
        if(r) console.log(r.data)
    }
}

main('200321541644039')
