import {
    KeyDownEvent,
    KeyUpEvent,
    StreamDeckAction,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { YTMD } from '../pear-desktop';
import {PearSocketClient} from '../services/pear-socket-client';
import {PearRestClient} from '../services/pear-rest-client';

export abstract class DefaultAction<Instance> extends StreamDeckAction<
    YTMD,
    Instance
> {
    socket: PearSocketClient;
    rest: PearRestClient;

    protected constructor(plugin: YTMD, actionName: string) {
        super(plugin, actionName);
        this.socket = YTMD.SOCKET;
        this.rest = YTMD.REST;
        console.info(`Initialized ${actionName}`);
        plugin.logMessage(`Initialized ${actionName}`);
    }

    abstract onContextAppear(event: WillAppearEvent): void;

    abstract onKeypressUp(event: KeyUpEvent): void;

    abstract onContextDisappear(event: WillDisappearEvent): void;

    onKeypressDown(event: KeyDownEvent): void {}
}
