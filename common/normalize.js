function to_array (hash) {
    // side effect: add hash[id].id
    let array = []
    for (let id of Object.keys(hash)) {
        hash[id].id = id
        array.push(hash[id])
    }
    return array
}


function date_inc (y, x) {
    return x.date < y.date
}


function id_inc (y, x) {
    return x.id < y.id
}


function normalize (data) {
    data.page_list = to_array(data.pages).sort(id_inc)
    data.article_list = to_array(data.articles).sort(date_inc)
}
