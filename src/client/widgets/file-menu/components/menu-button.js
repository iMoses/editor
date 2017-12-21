import { Component, PropTypes, cssModules } from 'lib/react';
import { ContextMenu, MenuHint } from 'widgets/context-area';

@cssModules(require('./menu-button.scss'))
export default class MenuButton extends Component {

    static propTypes = {
        context:      PropTypes.object.isRequired,
        active:       PropTypes.bool,
        onMouseDown:  PropTypes.func,
        onMouseEnter: PropTypes.func,
        onClose:      PropTypes.func,
    };

    componentDidMount() {
        this.offset = {top: this.ref.offsetHeight, left: this.ref.offsetLeft};
    }

    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        const { active, onMouseDown, onMouseEnter, ...props } = this.props;
        return (
            <div
                ref={ref => this.ref = ref}
                className={['menu-button', {active}]}
                onMouseDown={this.handleMouseDown}>

                <MenuHint
                    title={props.context.title}
                    className="button"
                    onMouseDown={onMouseDown}
                    onMouseEnter={onMouseEnter}
                />

                {active && <ContextMenu style={this.offset} {...props} autoFocus />}

            </div>
        );
    }

}
