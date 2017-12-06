import { Component, PropTypes } from 'lib/react';

export default class Draggable extends Component {

    static propTypes = {
        component:   PropTypes.any,
        onMouseDown: PropTypes.func,
        onMouseMove: PropTypes.func,
        onMouseUp:   PropTypes.func,
    };

    static defaultProps = {
        component: 'div',
    };

    handleMouseDown = event => {
        const { onMouseDown, onMouseMove, onMouseUp } = this.props;

        const payload = onMouseDown && onMouseDown(event);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        function handleMouseMove(event) {
            onMouseMove && onMouseMove(event, payload);
        }

        function handleMouseUp(event) {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            onMouseUp && onMouseUp(event, payload);
        }
    };

    render() {
        const { component: Component, onMouseDown, onMouseMove, onMouseUp, ...props } = this.props;
        return <Component {...props} onMouseDown={this.handleMouseDown} />;
    }

}
