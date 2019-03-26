function to_array (hash, show_hidden) {
    // side effect: add hash[id].id
    let array = []
    for (let id of Object.keys(hash)) {
        hash[id].id = id
        if (show_hidden || hash[id].visible) {
            array.push(hash[id])
        }
    }
    return array
}


function date_dec (y, x) {
    return x.date > y.date
}


function id_inc (y, x) {
    return x.id < y.id
}


function normalize (data, show_hidden = false) {
    data.list = {}
    data.list.settings = to_array(data.settings, true).sort(id_inc)
    data.list.pages = to_array(data.pages, show_hidden).sort(id_inc)
    data.list.articles = to_array(data.articles, show_hidden).sort(date_dec)
}
