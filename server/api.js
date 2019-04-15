let DATA_FILE = `${__dirname}/../data/data.json`
let SAVE_DELAY = 1500


let fs = require('fs')


let data = JSON.parse(fs.readFileSync(DATA_FILE))
let etag = null
let waiting = false


function time () {
    return (new Date()).toLocaleString()
}


function gen_etag () {
    let new_etag = ''
    for (let i=0; i<32; i++) {
        new_etag += String.fromCharCode(65+Math.floor(26*Math.random()))
    }
    etag = new_etag
}


function save_to_disk () {
    console.log(`[${time()}] saving data...`)
    fs.writeFileSync(DATA_FILE, JSON.stringify(data))
    console.log(`[${time()}] data saved successfully`)
}


function schedule_save_to_disk () {
    if (!waiting) {
        waiting = true
        setTimeout(() => {
            waiting = false
            save_to_disk()
        }, SAVE_DELAY)
    }
}


function save_to_memory () {
    console.log(`[${time()}] memory data updated`)
    gen_etag()
    // console.log(`[${time()}] refresh etag = ${etag}`)
    schedule_save_to_disk()
}


function get_data (req, res) {
    if (req.get('If-None-Match') === etag) {
        res.status(304).end()
    } else {
        res.set({ 'ETag': etag })
        res.json(data)
    }
}


function rejector (res) {
    return function (msg) {
        if (msg) {
            res.json({ ok: false, msg })
        } else {
            res.status(400).end()
        }
    }
}


function remove (req, res) {
    let reject = rejector(res)
    let req_object = req.data
    // console.log(req_object)
    let category = req_object.category
    let id = req_object.id
    if (!category || !id) { reject(); return }
    if (!data[category]) { reject(); return }
    if (!data[category][id]) {
        reject(`ID ${id} does not exist`)
        return
    }
    delete data[category][id]
    res.json({ ok: true })
    save_to_memory()
}


function update (req, res) {
    let reject = rejector(res)
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
    if (!item_object.is_new) {
        // record exists
        if(!data[category][old_id]) {
            reject(`ID ${old_id} does not exist`)
            return
        }
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
            save_to_memory()
            res.json({ ok: true })
        } else {
            // UPDATE: new id is the same as the old
            data[category][old_id] = new_data
            save_to_memory()
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
        save_to_memory()
        res.json({ ok: true })
    }
}


gen_etag()


module.exports = { get_data, remove, update, SAVE_DELAY }
