let INPUT_SELECTOR = 'text-field input, text-field textarea, option-field input'


let TextInput = (props => JSX({
    tag: 'text-field',
    children: [
        { tag: 'label', for: props.name, children: [props.label] },
        { tag: props.textarea? 'textarea': 'input', disabled: props.disabled,
          name: props.name, placeholder: props.label, spellcheck: 'false',
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
    }
    componentWillReceiveProps(new_props) {
        this.put_data(new_props.item.data)
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
