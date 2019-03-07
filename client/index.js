let { Route, Link, BrowserRouter: Router } = ReactRouterDOM


async function get_data() {
    try {
        let response = await fetch('data')
        let data = await response.json()
        // TODO: validate data
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}


let TitleBar = (props) => JSX({
    tag: 'div',
    children: [
        { tag: 'h1', children: [props.data.name] },
        { tag: 'p', children: [props.data.description] }
    ]
})


let PageSwitcher = (props) => JSX({
    tag: 'p',
    children: Array.concat([
        { tag: Link, to: '/', children: [MSG.articles] }
    ], props.pages.map(page => (
        { tag: Link, to: `/page/${page.id}`, children: [page.title] }
    )))
})


let ArticleList = (props) => JSX({
    tag: 'div',
    children: props.articles.map(article => (
        // TODO: route
        { tag: 'div', children: [
            { tag: Link, to: `/article/${article.id}`,
              children: [article.title] },
            { tag: 'p', children: [article.summary] }
        ] }
    ))
})


let Page = (props) => JSX({
    tag: 'div',
    children: [
        { tag: 'p', children: [props.page.content] }
    ]
})


let Article = (props) => JSX({
    tag: 'div',
    children: [
        { tag: Link, to: '/', children: [MSG.go_back] },
        { tag: 'p', children: [props.article.content] }
    ]
})


let PageContent = (props) => JSX({
    tag: 'div',
    children: Array.concat([
        { tag: Route, path: '/', exact: true,
          render: (route) => JSX({
              ...route,
              tag: ArticleList,
              data: props.data,
              articles: props.data.articles
          })
        }
    ], props.data.pages.map(page => (
        { tag: Route, path: `/page/${page.id}`,
          render: (route) => JSX({
              ...route,
              tag: Page,
              data: props.data,
              page: page
          })
        }
    )), props.data.articles.map(article => (
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


let PageWrapper = (props) => JSX({
    tag: Router,
    children: [
        { tag: 'div', children: [
            { tag: PageSwitcher, data: props.data, pages: props.data.pages },
            { tag: PageContent, data: props.data }
        ] }
    ]
})


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
    }
    render () {
        let content = {
            loading: () => JSX({
                tag: 'p',
                children: [MSG.loading]
            }),
            failed: () => JSX({
                tag: 'div',
                children: [
                    { tag: 'p', children: [MSG.failed] },
                    { tag: 'button', children: [MSG.retry], handlers: {
                        click: ev => this.load()
                    }}
                ]
            }),
            success: () => JSX({
                tag: 'div',
                children: [
                    {
                        tag: TitleBar,
                        data: this.state.data
                    },
                    {
                        tag: PageWrapper,
                        data: this.state.data
                    }
                    /*
                    {
                        tag: 'div',
                        children: [JSON.stringify(this.state.data)]
                    }
                    */
                ]
            })
        }
        return content[this.state.status]()
    }
}


ReactDOM.render(React.createElement(Blog), react_root)

