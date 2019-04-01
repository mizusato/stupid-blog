let INPUT_SELECTOR = 'text-field input, text-field textarea, option-field input'


let TextInput = (props => JSX({
    tag: 'text-field',
    children: [
        { tag: 'label', for: props.name, children: [props.label] },
        { tag: props.textarea? 'textarea': 'input', disabled: props.disabled,
          name: props.name, placeholder: props.label, spellcheck: 'false',
          className: props.use_code_editor? 'code': null,
          onInput: ev => props.dirty() }
    ]
}))


let OptionInput = (props => JSX({
    tag: 'option-field',
    children: [
        { tag: 'label', children: [
            { tag: 'input', type: 'checkbox', name: props.name,
              disabled: props.disabled, onChange: ev => props.dirty() },
            props.label
        ] },
    ]
}))


function prepare_data (form, data) {
    let fields = form.querySelectorAll(INPUT_SELECTOR)
    for (let field of fields) {
        if (field.type != 'checkbox') {
            field.value = data[field.name]
            if (field._update_editor_value) {
                field._update_editor_value()
            }
        } else {
            field.checked = data[field.name]
        }
    }
}


function pull_data (form) {
    let data = {}
    let fields = form.querySelectorAll(INPUT_SELECTOR)
    for (let field of fields) {
        if (field.type != 'checkbox') {
            data[field.name] = field.value
        } else {
            data[field.name] = field.checked
        }
    }
    return data
}


class FormComponent extends React.Component {
    constructor (props) {
        super(props)
    }
    componentDidMount () {
        this.put_data(this.props.item.data)
        for (let I of this.refs.form.querySelectorAll('textarea.code')) {
            I.style.display = 'none'
            let p = I.parentElement
            let loader = document.createElement('div')
            loader.classList.add('ace')
            let editor = ace.edit(loader, { mode: 'ace/mode/html' })
            editor.getSession().setUseWrapMode(true)
            editor.getSession().setValue(I.value)
            let force_set = false
            editor.getSession().on('change', () => {
                if (!force_set) {
                    I.value = editor.getSession().getValue()
                    I.dispatchEvent(new Event('input', { bubbles: true }))
                }
            })
            p.insertBefore(loader, I)
            I._update_editor_value = () => {
                force_set = true
                editor.getSession().setValue(I.value)
                force_set = false
            }
        }
    }
    componentWillReceiveProps(new_props) {
        if (new_props.item.id != this.props.item.id) {
            this.put_data(new_props.item.data)
        }
    }
    put_data (data) {
        prepare_data(this.refs.form, data)
    }
    dirty () {
        let new_data = pull_data(this.refs.form)
        this.props.dirty(new_data)
    }
    save () {
        this.props.save()
    }
    form_info () {
        return {
            dirty: this.dirty.bind(this),
            save: this.save.bind(this),
            can_input: !this.props.is_locked,
            can_save: this.props.item.dirty && !this.props.is_locked
        }
    }
}
