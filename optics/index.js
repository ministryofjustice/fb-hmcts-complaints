const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')

const processFile = async (file) => {
  let fileBuffer = fs.readFileSync(file).toString()
  fileBuffer = `,NAME,CODE,NOTES\n${fileBuffer}`
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
    return true
  }).map(item => ({
    _id: `court_code_${item.CODE.replace(/\s+/g, '_')}`,
    _type: 'option',
    text: item.NAME,
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
  // .map(item => {
  //   item.text = item.text.replace(/Magistrates'/, 'Magistrates')
  //   return item
  // })

  courtsList.unshift({
    _id: 'court_code__default',
    _type: 'option',
    text: 'Select a court or tribunal',
    value: ''
  })

  fs.writeFileSync('./courts-list-options.json', JSON.stringify(courtsList, null, 2))

  const pathToAutcompleteComponent = path.join('..', 'metadata', 'page', 'page.location.json')

  const autocompleteJSON = require(pathToAutcompleteComponent)
  autocompleteJSON.components[0].items = courtsList
  fs.writeFileSync(pathToAutcompleteComponent, JSON.stringify(autocompleteJSON, null, 2))
}

processFile('./OPTIC-courts-list.csv')
