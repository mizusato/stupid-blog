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


function date_inc (y, x) {
    return x.date < y.date
}


function id_inc (y, x) {
    return x.id < y.id
}


function normalize (data, show_hidden = false) {
    data.page_list = to_array(data.pages, show_hidden).sort(id_inc)
    data.article_list = to_array(data.articles, show_hidden).sort(date_inc)
}
