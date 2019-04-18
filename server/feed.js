let feedster = require('feedster');
let api = require('./api')


function rss (req, res) {
    let data = api.get_raw_data()
    let meta = data.settings.meta
    let feed = feedster.createFeed({
        title: meta.name,
        description: meta.description,
        link: meta.url
    })
    let articles = Object.keys(data.articles).sort((l,r) => {
        let ld = data.articles[l].date
        let rd = data.articles[r].date
        if (ld == rd) { return 0 }
        return (ld < rd)? 1: -1
    })
    let count = 0
    for (let id of articles) {
        let article = data.articles[id]
        if (!article.visible) { continue }
        if (count > 100) { break }
        feed.addItem({
            category: article.tags.split(',').map(tag => tag.trim()),
            description: article.summary,
            link: `${meta.url}/article/${id}`,
            pubDate: article.date,
            title: article.title,
            content: article.content,
            creator: meta.name
        })
        count += 1
    }
    res.set('Content-Type', 'application/rss+xml')
    res.send(feed.render())
}


module.exports = { rss }
