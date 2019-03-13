let DATA_FILE = 'data.json'


let fs = require('fs')


let data = JSON.parse(fs.readFileSync(DATA_FILE))
let etag = null


function gen_etag () {
    let new_etag = ''
    for (let i=0; i<32; i++) {
        for (let j=0; j<26; j++) {
            new_etag += String.fromCharCode(65+Math.floor(26*Math.random()))
        }
    }
    etag = new_etag
}



function save () {
    gen_etag()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data))
}


function get_data (req, res) {
    if (req.get('If-None-Match') === etag) {
        res.status(304).end()
    } else {
        res.set({ 'ETag': etag })
        res.json(data)
    }
}


function test_admin (req, res) {
    res.send('Authorized Admin ~~~')
}


gen_etag()


module.exports = { get_data, test_admin }
