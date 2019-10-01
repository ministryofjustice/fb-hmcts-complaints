const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')

const processFile = async (file) => {
  const excludes = fs.readFileSync('./OPTIC-exclude.txt').toString()
    .split('\n')
    .map(item => item.trim())

  let fileBuffer = fs.readFileSync(file).toString()
  fileBuffer = `,,CODE,NAME,NOTES,COMMENTS\n${fileBuffer}`
  const csvData = await neatCsv(fileBuffer)
  const courtsList = csvData.filter(item => {
    if (!item.NAME) {
      return false
    }
    if (!item.CODE) {
      return false
    }
    if (item.CODE === 'Code') {
      return false
    }
    if (item.NOTES.match(/deleted|removed/i)) {
      return false
    }
    if (item.COMMENTS.match(/delete|remove/i)) {
      return false
    }
    return true
  })
    .filter(item => {
      return !excludes.includes(item.NAME) && !excludes.includes(item.CODE)
    })
    .map(item => ({
      _id: `court_code_${item.CODE.replace(/\s+/g, '_')}`,
      _type: 'option',
      text: `${item.NAME.replace(/&/g, 'and').replace('RCJ', 'Royal Courts of Justice').replace('ASC', 'Administrative Support Centre')}`,
      value: item.CODE
    }))
    .sort((a, b) => {
      if (a.text < b.text) {
        return -1
      }
      if (a.text > b.text) {
        return 1
      }
      return 0
    })

  courtsList.unshift({
    _id: 'court_code__default',
    _type: 'option',
    text: 'Select a court or tribunal',
    'text:cy': 'Rhowch enw llys neu dribiwnlys yn y blwch',
    value: ''
  })

  fs.writeFileSync('./courts-list-options.json', JSON.stringify(courtsList, null, 2))

  const pathToAutcompleteComponent = path.join('..', 'metadata', 'page', 'page.location.json')

  const autocompleteJSON = require(pathToAutcompleteComponent)
  autocompleteJSON.components[0].items = courtsList
  fs.writeFileSync(pathToAutcompleteComponent, JSON.stringify(autocompleteJSON, null, 2))
}

processFile('./OPTIC-courts-list.csv')
