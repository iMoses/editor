import { observable, computed, action, observe, when } from 'mobx';
import { WebSocketInterface, UA } from 'jssip';
import _ from 'lodash';

const on = (e, n, h) => _.isPlainObject(n)
    ? _.each(n, (h, n) => e.addEventListener(n.toLowerCase(), h))
    : e.addEventListener(n.toLowerCase(), h);

export default class PeerConnection {

    @observable status = {
        local:  false,
        remote: false,
    };

    constructor(servers = null) {
        const passIceCandidateTo = type => action.bound(e =>
            e.candidate && this[type]
                .addIceCandidate(e.candidate)
                .catch(this.handleErrors)
        );

        this.local  = new RTCPeerConnection(servers);
        this.remote = new RTCPeerConnection(servers);

        on(this.local, 'iceCandidate', passIceCandidateTo('remote'));
        on(this.remote, {
            dataChannel: event =>
                on(this.receiveChannel = event.channel, {
                    open:    this.handleReceiveChannelStateChange,
                    close:   this.handleReceiveChannelStateChange,
                    message: this.handleReceiveMessageCallback,
                }),
            iceCandidate: passIceCandidateTo('local'),
        });

        on(this.sendChannel = this.local.createDataChannel('sendChannel'), {
            open:  this.handleSendChannelStateChange,
            close: this.handleSendChannelStateChange,
        });



        const socket = new WebSocketInterface('wss://localhost');
        const ua = new UA({
            sockets:  [socket],
            uri:      'sip:imoses@editor',
            password: '4609'
        });
        ua.start();

        // const session = ua.call('sip:ido@editor', {
        //     eventHandlers: {
        //         progress(e) {
        //             console.log('call is in progress');
        //         },
        //         failed(e) {
        //             console.log('call failed with cause: '+ e.data.cause);
        //         },
        //         ended(e) {
        //             console.log('call ended with cause: '+ e.data.cause);
        //         },
        //         confirmed(e) {
        //             console.log('call confirmed');
        //         },
        //     },
        //     mediaConstraints: {
        //         audio: true,
        //         video: true,
        //     }
        // });

    }

    @computed
    get ready() {
        return this.status.local && this.status.remote;
    }

    async connect() {
        const offer = await this.local.createOffer();
        await this.local.setLocalDescription(offer);
        await this.remote.setRemoteDescription(this.local.localDescription);

        const answer = await this.remote.createAnswer();
        await this.remote.setLocalDescription(answer);
        await this.local.setRemoteDescription(this.remote.localDescription);
    }

    close() {
        this.local.close();
        this.remote.close();
        this.sendChannel.close();
        this.receiveChannel.close();
    }

    sendMessage(message = null) {
        this.ready
            ? this.sendChannel.send(JSON.stringify(message))
            : when(() => this.ready, () => this.sendMessage(message));
    }

    @action.bound
    handleSendChannelStateChange() {
        this.status.local = this.sendChannel.readyState;
    }

    @action.bound
    handleReceiveChannelStateChange() {
        this.status.remote = this.receiveChannel.readyState;
    }

    @action.bound
    handleReceiveMessageCallback(event) {
        console.log(event);
    }

    handleErrors(err) {
        console.error(this, err);
    }

}
