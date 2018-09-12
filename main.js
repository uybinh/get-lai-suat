let request = require("request")
let fs = require("fs")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

const url = "http://laisuatvn.com/laisuatnganhang/bangthamchieu/widgets"

async function fetchDOM(url) {
  return new Promise((resolve, reject) => {
    request(url, function(err, response, body) {
      if (err) {
        reject(err)
      } else {
        let { document } = new JSDOM(body).window
        resolve(document)
      }
    })
  })
}

fetchDOM(url)
  .then(document =>
    Array.prototype.slice.call(document.querySelectorAll("tr"), 3)
  )
  .then(tablerows => tablerows.map(tablerow => getRateData(tablerow)))
  .then(data => {
    saveFileAsCsv(data)
    saveFileAsJson(data)
  })

/**
 *
 *
 * @param {NodeList} tr
 * @returns json object
 */
function getRateData(tr) {
  const rateData = { bank: "", rates: [] }
  Array.prototype.slice.call(tr.children).forEach((child, index) => {
    if (index == 0) {
      rateData.bank = child.children[0].alt
    } else {
      rateData.rates.push(child.textContent)
    }
  })
  return rateData
}

/**
 *
 *
 * @param {object} data data object
 */
function saveFileAsJson(data) {
  const date = formatDate(new Date())
  const fileName = `rates-${date}.json`
  fs.writeFile(fileName, JSON.stringify(data), "utf8", err => {
    if (err) throw err
    console.log("The file has been saved as JSON!")
  })
}

/**
 *
 *
 * @param {JSON Object} data
 */
function saveFileAsCsv(data) {
  const date = formatDate(new Date())
  const fileName = `rates-${date}.csv`
  const content = jsonToCsv(data)
  fs.writeFile(fileName, content, "utf8", err => {
    if (err) throw err
    console.log("The file has been saved as CSV!")
  })
}

function formatDate(date) {
  return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`
}

function jsonToCsv(json) {
  let header =
    "Bank,KKH,1 month,2 month,3 month,6 month,9 month,12 month,18 month, 24 month,36 month"
  return (
    header +
    "\n" +
    json
      .map(rateData => rateData.bank + "," + rateData.rates.join(","))
      .join("\n")
  )
}
