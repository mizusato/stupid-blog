function for_vals_of (hash, f) {
    for (let key of Object.keys(hash)) {
        f(hash[key])
    }
}


function get_token () {
    return sessionStorage.getItem('token')
}


function set_token (value) {
    sessionStorage.setItem('token', value)
}


function clear_token () {
    sessionStorage.removeItem('token')
}


let Loading = (props) => JSX({
    tag: 'loading-tip',
    children: [
        { tag: 'span', children: [MSG.loading] }
    ]
})


class Login extends React.Component {
    get_form_data () {
        let username = this.refs.username.value
        let password = this.refs.password.value
        return { username, password }
    }
    disable_form() {
        for_vals_of(this.refs, x => x.disabled = true)
    }
    enable_form() {
        for_vals_of(this.refs, x => x.disabled = false)
    }
    retype_password () {
        this.refs.password.value = ''
        this.refs.password.focus()
    }
    info (status) {
        this.refs.msg.dataset.status = status
        this.refs.msg.textContent = MSG.login_status[status]
        if (status == 'pending') {
            this.refs.button.textContent = MSG.login_status.pending
            this.disable_form()
        } else if (status == 'failed') {
            this.refs.button.textContent = MSG.login
            this.enable_form()
            this.retype_password()
        } else if (status == 'success') {
            this.refs.button.style.display = 'none'
        }
    }
    pending () {
        this.info('pending')
    }
    failed () {
        this.info('failed')
    }
    success (token) {
        this.info('success')
        this.props.success(token)
    }
    submit () {        
        (async () => {
            this.pending()
            let data = this.get_form_data()
            let body = JSON.stringify(data)
            var res;
            try {
                let raw = await fetch('login', { method: 'POST', body: body })
                res = await raw.json()
            } catch (err) {
                console.log(err)
                this.failed()
            }
            if (res.success) {
                this.success(res.token)
            } else {
                this.failed()
            }
        })()
    }
    render () {
        return JSX({
            tag: 'dialog-wrapper',
            children: [{
                tag: 'dialog-box',
                children: [
                    {
                        tag: 'dialog-title',
                        children: [MSG.login_title]
                    },
                    { tag: 'hr' },
                    {
                        tag: 'dialog-content',
                        children: [
                            {
                                tag: 'input',
                                ref: 'username',
                                placeholder: MSG.username
                            },
                            {
                                tag: 'input',
                                type: 'password',
                                ref: 'password',
                                placeholder: MSG.password,
                                handlers: { keyUp: ev => {
                                    if (ev.key == 'Enter') {
                                        this.submit()
                                    }
                                }}
                            },
                            {
                                tag: 'form-message',
                                ref: 'msg',
                                children: ['']
                            },
                            {
                                tag: 'button',
                                ref: 'button',
                                children: [MSG.login],
                                handlers: { click: ev => this.submit() }
                            }
                        ]
                    }
                ]
            }]
        })
    }
}


class SideBar extends React.Component {
    render () {
        return JSX({
            tag: 'side-bar',
            children: this.props.data.article_list.map(article => ({
                tag: 'div',
                children: [article.title]
            }))
        })
    }
}


class EditArea extends React.Component {
    render () {
        return JSX({
            tag: 'edit-area'
        })
    }
}


class MainView extends React.Component {
    render () {
        return JSX({
            tag: 'main-view',
            children: [
                { tag: SideBar, data: this.props.data },
                { tag: EditArea }
            ]
        })
    }
}


class Admin extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            signed_in: (get_token() != null),
            wait_at_dialog: false,
            loaded: false
        }
        if (this.state.signed_in) {
            this.load_data()
        }
    }
    load_data () {
        ;(async () => {
            var data;
            try {
                let raw = await fetch('/data')
                data = await raw.json()
                normalize(data)
            } catch (err) {
                console.log(err)
                alert(MSG.failed)
                window.location.reload()
            }
            this.setState({ wait_at_dialog: false, loaded: true, data: data })
        })()
    }
    login (token) {
        set_token(token)
        this.load_data()
        this.setState({ signed_in: true, wait_at_dialog: true })
    }
    render () {
        let { signed_in, loaded, wait_at_dialog, data } = this.state
        if (!signed_in || wait_at_dialog ) {
            return JSX({ tag: Login, success: token => this.login(token) })
        } else if (!loaded) {
            return JSX({ tag: Loading })
        }
        return JSX({ tag: MainView, data: data })
    }
}


document.title = MSG.admin_title
ReactDOM.render(React.createElement(Admin), react_root)
