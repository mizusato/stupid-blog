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


function update (req, res) {
    function reject (msg) {
        if (msg) {
            res.json({ ok: false, msg })
        } else {
            res.status(400).end()
        }
    }
    let req_object = req.data
    // console.log(req_object)
    let category = req_object.category
    let item_object = req_object.item_object
    if (!category || !item_object) { reject(); return }
    if (!data[category]) { reject(); return }
    let old_id = item_object.id
    let new_id = item_object.data.id
    let new_data = item_object.data
    delete new_data['id']
    if (data[category][old_id]) {
        // record exists
        if (old_id != new_id) {
            // RENAME: new id is different from the old
            if (category == 'settings') { reject(); return }
            if (data[category][new_id]) {
                // new id already used
                reject(`ID "${new_id}" already used`)
                return
            }
            data[category][new_id] = new_data
            delete data[category][old_id]
            gen_etag()
            res.json({ ok: true })
        } else {
            // UPDATE: new id is the same as the old
            data[category][old_id] = new_data
            gen_etag()
            res.json({ ok: true })
        }
    } else {
        // ADD: record does not exist
        // if (old_id != new_id) { reject(); return }
        if (category == 'settings') { reject(); return }
        if (data[category][new_id]) {
            reject(`ID "${new_id}" already used`)
            return
        }
        data[category][new_id] = new_data
        gen_etag()
        res.json({ ok: true })
    }
}


gen_etag()


module.exports = { get_data, update }
