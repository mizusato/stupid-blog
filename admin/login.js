/**
 *  Loading Tip
 */
let Loading = (props) => JSX({
    tag: 'loading-tip',
    children: [
        { tag: 'span', children: [MSG.loading] }
    ]
})


/**
 *  Login View (Dialog)
 */
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
        ;(async () => {
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
        return JSX({ tag: 'dialog-wrapper', children: [{
            tag: 'dialog-box', children: [
                { tag: 'dialog-title', children: [MSG.login_title] },
                { tag: 'hr' },
                { tag: 'dialog-content', children: [
                    { tag: 'input', ref: 'username',
                      placeholder: MSG.username },
                    { tag: 'input', type: 'password', ref: 'password',
                      placeholder: MSG.password,
                      handlers: {
                          keyUp: ev => (ev.key == 'Enter') && this.submit()
                      } },
                    { tag: 'form-message', ref: 'msg', children: [''] },
                    { tag: 'button', ref: 'button', children: [MSG.login],
                      handlers: { click: ev => this.submit() } }
                  ]
              } ]
        } ] })
    }
}
