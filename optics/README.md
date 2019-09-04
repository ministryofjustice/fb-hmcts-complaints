# Updating optic list

## Pre-requisites

- Latest OPTIC list (`.xlsm`)
- Node (Run `npm install` (first time))

## Procedure

- Export main sheet from xlsm file as csv (`OPTIC-courts-list.csv`)
- Run `node index.js`

This will update the autocomplete items on the location page (`metadata/page/page.location.json`).

NB. any changes will need to be manually committed to Git.

## Excluding items

Add any name and/or value of items to exclude to `OPTIC-exclude.txt`
