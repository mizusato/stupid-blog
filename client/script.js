let { Route, Link, BrowserRouter: Router } = ReactRouterDOM


/**
 *  Fetch data from server using the HTML5 fetch API
 *
 *  @return Object (null when data is unavailable or invalid)
 */
async function get_data() {
    try {
        let response = await fetch('/data')
        let data = await response.json()
        // TODO: validate data
        normalize(data)
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}


/**
 *  Root Component
 */
class Blog extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            status: 'loading'
        }
    }
    async load () {
        this.setState({ status: 'loading' })
        let data = await get_data()
        if (data != null) {
            this.setState({ status: 'success', data: data })
        } else {
            this.setState({ status: 'failed' })
        }
    }
    componentDidMount () {
        this.load()
        let title = MSG.title[this.state.status]
        if (title) { document.title = title }
    }
    render () {
        let content = {
            loading: () => JSX({
                tag: 'blog',
                className: 'loading',                
                children: [
                    { tag: 'wrapper', children: [MSG.loading] }
                ]
            }),
            failed: () => JSX({
                tag: 'blog',
                className: 'failed',
                children: [
                    { tag: 'wrapper', children: [
                        { tag: 'p', children: [MSG.failed] },
                        { tag: 'button', children: [MSG.retry], handlers: {
                            click: ev => this.load()
                        }}
                    ] }
                ]
            }),
            success: () => JSX({
                tag: 'blog',
                className: 'ready',
                children: [
                    {
                        tag: Router,
                        children: [
                            { tag: 'wrapper', children: [
                                { tag: Header, data: this.state.data },
                                { tag: Content, data: this.state.data }
                            ] }
                        ]
                    }
                ]
            })
        }
        return content[this.state.status]()
    }
}


/**  Header  **/


let Header = (props) => JSX({
    tag: 'header',
    children: [
        { tag: TitleBar, data: props.data },
        { tag: NavBar, data: props.data, page_list: props.data.page_list }
    ]
})

let TitleBar = (props) => JSX({
    tag: 'title-bar',
    children: [
        { tag: React.Fragment, children: [
            { tag: 'h1', children: [props.data.meta.name] },
            { tag: 'p', children: [props.data.meta.description] }
        ] }
    ]
})

let NavBar = (props) => JSX({
    tag: 'nav-bar',
    children: concat([
        { tag: Link, to: '/', children: [props.data.meta.home_link] }
    ], props.page_list.map(page => (
        { tag: Link, to: `/page/${page.id}`, children: [page.title] }
    )))
})


/**  Content  **/


let Content = (props) => JSX({
    tag: 'content',
    children: concat([
        { tag: Route, path: '/', exact: true,
          render: (route) => JSX({
              ...route,
              tag: ArticleList,
              data: props.data,
              article_list: props.data.article_list
          })
        }
    ], props.data.page_list.map(page => (
        { tag: Route, path: `/page/${page.id}`,
          render: (route) => JSX({
              ...route,
              tag: Page,
              data: props.data,
              page: page
          })
        }
    )), props.data.article_list.map(article => (
        { tag: Route, path: `/article/${article.id}`,
          render: (route) => JSX({
              ...route,
              tag: Article,
              data: props.data,
              article: article
          })
        }
    )))
})

class ArticleList extends React.Component {
    componentDidMount () {
        document.title = this.props.data.meta.title
    }
    render () {
        let props = this.props
        return JSX({
            tag: 'article-list',
            children: props.article_list.map(article => (
                // TODO: route
                { tag: 'article-item', children: [
                    { tag: Link, className: 'title',
                      to: `/article/${article.id}`,
                      children: [article.title] },
                    { tag: 'summary',
                      children: [article.summary] }
                ] }
            ))
        })
    }
}

class Page extends React.Component {
    componentDidMount () {
        let site_title = this.props.data.meta.title
        document.title = `${this.props.page.title} - ${site_title}`
    }
    render () {
        return JSX({
            tag: 'page',
            children: [this.props.page.content]
        })
    }
}

class Article extends React.Component {
    componentDidMount () {
        let site_title = this.props.data.meta.title
        document.title = `${this.props.article.title} - ${site_title}`
    }
    render () {
        let props = this.props
        return JSX({
            tag: 'article',
            children: [
                { tag: 'h1', className: 'title',
                  children: [props.article.title] },
                { tag: 'p',
                  children: [props.article.content] }
            ]
        })
    }
}


// Render the Root Component
ReactDOM.render(React.createElement(Blog), react_root)

