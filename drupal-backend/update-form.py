import requests
import os

api_key = os.environ['JOT_API_KEY']

def sortMapOfNames(l):
    return sorted([o['name'] for o in l if o['name'] != ''], key=str.casefold)

def getNamed(field):
    url = 'https://oga-boats.herokuapp.com/'
    data={"query":'query{'+field+'{name}}'}
    r = requests.post(url, json=data)
    return r.json()["data"][field]

def getSimple(field):
    url = 'https://oga-boats.herokuapp.com/'
    data={"query":'query{'+field+'}'}
    r = requests.post(url, json=data)
    return r.json()["data"][field]

# curl -X POST -d 'question[options]=Crabber 24|Hurd 28|Golant Gaffer' https://eu-api.jotform.com/form/200321541644039/question/56?apikey=$JOT_API_KEY
def updateQuestion(form, qid, field, newValue):
    url = "http://eu-api.jotform.com/form/%s/question/%s?apikey=%s" % (form, qid, api_key)
    data = {"question["+field+"]": newValue}
    r = requests.post(url, data=data)
    print(r.text)
    return r

def main():
    form_id = 200321541644039
    r = requests.get('https://eu-api.jotform.com/user/forms?apikey='+api_key)
    forms = r.json()['content']
    r = requests.get('https://eu-api.jotform.com/form/200321541644039?apikey='+api_key)
    form = r.json()
    r = requests.get('https://eu-api.jotform.com/form/200321541644039/questions?apikey='+api_key)
    questions = r.json()['content']
    bl = getNamed('builders')
    sbl = sortMapOfNames(bl)
    builders = '|'.join(sbl)
    dl = getNamed('designers')
    sdl = sortMapOfNames(dl)
    designers = '|'.join(sdl)
    scl = sorted(getSimple('classNames'), key=str.casefold)
    classNames = '|'.join(scl)
    genericTypes = '|'.join(sorted(getSimple('genericTypes'), key=str.casefold))
    for qid in questions:
        question = questions[qid]
        if question['name'] == 'builder':
            if question['items'] != builders:
                updateQuestion(form_id, qid, 'items', builders)
        elif question['name'] == 'designer':
            if question['items'] != designers:
                updateQuestion(form_id, qid, 'items', designers)
        elif question['name'] == 'className':
            if question['items'] != classNames:
                updateQuestion(form_id, qid, 'items', classNames)
        elif question['name'] == 'genericType':
            if question['items'] != genericTypes:
                updateQuestion(form_id, qid, 'items', genericTypes)

if __name__ == "__main__":
    main()
