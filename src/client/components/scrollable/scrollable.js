import ResizeObserver from 'resize-observer-polyfill';
import { Component, cssModules } from 'lib/react';
import Draggable from '../draggable';

@cssModules(require('./scrollable.scss'))
export default class Scrollable extends Component {

    static thumbSizeMin = 0;

    static mutationConfig = {
        subtree:       true,
        childList:     true,
        attributes:    true,
        characterData: true,
    };

    state = {
        thumbSizeX:     0,
        thumbSizeY:     0,
        trackRatioX:    0,
        trackRatioY:    0,
        thumbPositionX: 0,
        thumbPositionY: 0,
    };

    static calcThumbSize(ratio, trackOffset) {
        return Math.max(Math.round(ratio * trackOffset), Scrollable.thumbSizeMin);
    }

    componentDidMount() {
        this.mutationObserver = new MutationObserver(() => this.requestUpdate());
        this.mutationObserver.observe(this.viewport, Scrollable.mutationConfig);
        this.resizeObserver = new ResizeObserver(() => this.requestUpdate());
        this.resizeObserver.observe(this.viewport);
        this.requestUpdate();
    }

    componentWillUnmount() {
        this.mutationObserver.disconnect();
        this.resizeObserver.disconnect();
    }

    requestUpdate() {
        this.update();
        // TODO: optimize?
        // if (!this._reqId) {
        //     this._reqId = window.requestAnimationFrame(() => {
        //         this.update();
        //         delete this._reqId;
        //     });
        // }
    }

    update() {
        const { viewport, trackX, trackY } = this;

        const ratioX = viewport.offsetWidth / viewport.scrollWidth || 0;
        const ratioY = viewport.offsetHeight / viewport.scrollHeight || 0;

        const overflowX = viewport.scrollWidth - viewport.offsetWidth;
        const overflowY = viewport.scrollHeight - viewport.offsetHeight;

        const thumbSizeX = Scrollable.calcThumbSize(ratioX, trackX.offsetWidth);
        const thumbSizeY = Scrollable.calcThumbSize(ratioY, trackY.offsetHeight);

        const trackRatioX = overflowX / (trackX.offsetWidth - thumbSizeX) || 0;
        const trackRatioY = overflowY / (trackY.offsetHeight - thumbSizeY) || 0;

        const thumbPositionX = viewport.scrollLeft / trackRatioX || 0;
        const thumbPositionY = viewport.scrollTop / trackRatioY || 0;

        this.setState({
            thumbSizeX,
            thumbSizeY,
            trackRatioX,
            trackRatioY,
            thumbPositionX,
            thumbPositionY,
        });
    }

    handleTrackDown(event, isVertical) {
        const pageUp = isVertical
            ? event.clientY < this.thumbY.getBoundingClientRect().top
            : event.clientX < this.thumbX.getBoundingClientRect().left;

        isVertical
            ? this.viewport.scrollTop += (pageUp ? -1 : 1) * this.viewport.offsetHeight
            : this.viewport.scrollLeft += (pageUp ? -1 : 1) * this.viewport.offsetWidth;

        event.stopPropagation();
    }

    handleThumbDown(event, isVertical) {
        const options = {isVertical};

        if (isVertical) {
            options.mousePosition   = event.clientY;
            options.initialPosition = this.viewport.scrollTop;
        }
        else {
            options.mousePosition   = event.clientX;
            options.initialPosition = this.viewport.scrollLeft;
        }

        event.stopPropagation();

        return options;
    }

    handleThumbMove = (event, { isVertical, initialPosition, mousePosition }) =>
        isVertical
            ? this.viewport.scrollTop = initialPosition + (event.clientY - mousePosition) * this.state.trackRatioY
            : this.viewport.scrollLeft = initialPosition + (event.clientX - mousePosition) * this.state.trackRatioX;

    handleScroll = () => this.requestUpdate();

    handleTrackX = event => this.handleTrackDown(event, false);
    handleTrackY = event => this.handleTrackDown(event, true);
    handleThumbX = event => this.handleThumbDown(event, false);
    handleThumbY = event => this.handleThumbDown(event, true);

    render() {
        const {
            props: { debug, relative, className, children, ...props },
            state: {
                thumbSizeX,
                thumbSizeY,
                trackRatioX,
                trackRatioY,
                thumbPositionX,
                thumbPositionY,
            },
        } = this;
        return (
            <div className={['scrollable', className, {relative}]} {...props}>

                <div ref={ref => this.viewport = ref}
                     className="content scrollable-content"
                     onScroll={this.handleScroll}>
                    {children}
                </div>

                <span ref={ref => this.trackX = ref}
                      className={['track x-axis', {visible: trackRatioX}]}
                      onMouseDown={this.handleTrackX}>

                    <Draggable
                        component="span"
                        className="thumb"
                        ref={ref => this.thumbX = ref}
                        style={{left: thumbPositionX, width: thumbSizeX}}
                        onMouseDown={this.handleThumbX}
                        onMouseMove={this.handleThumbMove}
                    />

                </span>

                <span ref={ref => this.trackY = ref}
                      className={['track y-axis', {visible: trackRatioY}]}
                      onMouseDown={this.handleTrackY}>

                    <Draggable
                        component="span"
                        className="thumb"
                        ref={ref => this.thumbY = ref}
                        style={{top: thumbPositionY, height: thumbSizeY}}
                        onMouseDown={this.handleThumbY}
                        onMouseMove={this.handleThumbMove}
                    />

                </span>

            </div>
        );
    }

}
