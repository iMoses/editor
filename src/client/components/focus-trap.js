import { Component, PropTypes, ReactDOM } from 'lib/react';

export default class FocusTrap extends Component {

    static propTypes = {
        component:      PropTypes.any,
        autoFocus:      PropTypes.bool,
        onBlur:         PropTypes.func,
        onFocus:        PropTypes.func,
        onFocusEnter:   PropTypes.func,
        onFocusLeave:   PropTypes.func,
        children:       PropTypes.node,
    };

    static defaultProps = {
        component:  'div',
        autoFocus:  false,
    };

    static contextTypes = {
        trap:   PropTypes.object,
    };

    static childContextTypes = {
        trap:   PropTypes.object,
    };

    getChildContext() {
        return {trap: this};
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            this.focus();
        }
    }

    get parentTrap() {
        return this.context.trap;
    }

    handleBlur(event) {
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
        event.persist();
        this.delayId = setTimeout(() => {
            if (this.props.onFocusLeave) {
                this.props.onFocusLeave(event);
            }
            delete this.delayId;
        }, 0);
    }

    handleFocus(event) {
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
        if (this.delayId) {
            clearTimeout(this.delayId);
            delete this.delayId;
        }
        else if (this.props.onFocusEnter) {
            this.props.onFocusEnter(event);
        }
    }

    blur() {
        ReactDOM.findDOMNode(this).blur();
    }

    focus() {
        ReactDOM.findDOMNode(this).focus();
    }

    render() {
        const { component: Component, onFocusEnter, onFocusLeave, ...props } = this.props;
        return <Component ref={component => this.component = component}
                          tabIndex="-1" {...props}
                          onBlur={e => this.handleBlur(e)}
                          onFocus={e => this.handleFocus(e)}/>;
    }

}
