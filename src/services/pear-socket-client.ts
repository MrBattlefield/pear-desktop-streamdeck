import {SocketState, TrackState, type StateOutput} from 'ytmdesktop-ts-companion';

type PearMessage = {
    type?: string;
    song?: {
        title?: string;
        artist?: string;
        album?: string;
        imageSrc?: string;
        videoId?: string;
        songDuration?: number;
        isPaused?: boolean;
    };
    isPlaying?: boolean;
    position?: number;
};

type StateListener = (state: StateOutput) => void;
type ConnectionListener = (state: SocketState) => void;
type ErrorListener = (error: unknown) => void;

export class PearSocketClient {
    private socket?: WebSocket;
    private settings: {host: string; port: number; token?: string};
    private stateListeners: StateListener[] = [];
    private connectionListeners: ConnectionListener[] = [];
    private errorListeners: ErrorListener[] = [];
    private state: StateOutput = {
        player: {
            adPlaying: false,
            queue: null,
            trackState: TrackState.UNKNOWN,
            videoProgress: 0,
            volume: 100,
        },
        video: null,
        playlistId: null,
    };

    constructor(settings: {host: string; port: number; token?: string}) {
        this.settings = settings;
    }

    setSettings(settings: {host: string; port: number; token?: string}) {
        this.settings = settings;
    }

    addStateListener(listener: StateListener) { this.stateListeners.push(listener); }
    removeStateListener(listener: StateListener) {
        this.stateListeners = this.stateListeners.filter((item) => item !== listener);
    }
    addConnectionStateListener(listener: ConnectionListener) { this.connectionListeners.push(listener); }
    removeConnectionStateListener(listener: ConnectionListener) {
        this.connectionListeners = this.connectionListeners.filter((item) => item !== listener);
    }
    addErrorListener(listener: ErrorListener) { this.errorListeners.push(listener); }
    removeErrorListener(listener: ErrorListener) {
        this.errorListeners = this.errorListeners.filter((item) => item !== listener);
    }

    connect() {
        this.socket?.close();
        this.connectionListeners.forEach((listener) => listener(SocketState.CONNECTING));
        const query = this.settings.token ? `?token=${encodeURIComponent(this.settings.token)}` : '';
        this.socket = new WebSocket(`ws://${this.settings.host}:${this.settings.port}/api/v1/ws${query}`);
        this.socket.onopen = () => this.connectionListeners.forEach((listener) => listener(SocketState.CONNECTED));
        this.socket.onclose = () => this.connectionListeners.forEach((listener) => listener(SocketState.DISCONNECTED));
        this.socket.onerror = (error) => {
            this.errorListeners.forEach((listener) => listener(error));
            this.connectionListeners.forEach((listener) => listener(SocketState.ERROR));
        };
        this.socket.onmessage = ({data}) => {
            try {
                this.applyMessage(JSON.parse(data) as PearMessage);
            } catch (error) {
                this.errorListeners.forEach((listener) => listener(error));
            }
        };
    }

    private applyMessage(message: PearMessage) {
        if (message.song) {
            this.state.video = {
                id: message.song.videoId ?? '',
                title: message.song.title ?? '',
                author: message.song.artist ?? '',
                album: message.song.album ?? '',
                channelId: '',
                albumId: '',
                likeStatus: 0,
                durationSeconds: message.song.songDuration ?? 0,
                thumbnails: message.song.imageSrc ? [{url: message.song.imageSrc, width: 0, height: 0}] : [],
            };
        }
        if (typeof message.position === 'number') this.state.player.videoProgress = message.position;
        if (typeof message.isPlaying === 'boolean') {
            this.state.player.trackState = message.isPlaying ? TrackState.PLAYING : TrackState.PAUSED;
        }
        this.stateListeners.forEach((listener) => listener(this.state));
    }
}
