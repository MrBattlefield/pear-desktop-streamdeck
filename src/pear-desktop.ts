import {DidReceiveGlobalSettingsEvent, SDOnActionEvent, StreamDeckPluginHandler,} from 'streamdeck-typescript';
import {LikeDislikeAction} from './actions/like-dislike.action';
import {MuteAction} from './actions/mute.action';
import {NextPrevAction} from './actions/next-prev-action';
import {PlayPauseAction} from './actions/play-pause.action';
import {PlayPlaylistAction} from './actions/play-playlist.action';
import {RepeatAction} from './actions/repeat.action';
import {ShuffleAction} from './actions/shuffle.action';
import {SongInfoAction} from './actions/song-info.action';
import {VolChangeAction} from './actions/vol-change.action';
import {ActionTypes} from './interfaces/enums';
import {GlobalSettingsInterface} from './interfaces/global-settings.interface';
import VERSION from "./version";
import {CompanionConnector, LikeStatus, Settings} from "ytmdesktop-ts-companion";
import {PluginData} from "./shared/plugin-data";
import {PearSocketClient} from './services/pear-socket-client';
import {PearRestClient} from './services/pear-rest-client';

export class PearDesktopPlugin extends StreamDeckPluginHandler {
    private static readonly _DEFAULT_SETTINGS: Settings = {
        appId: PluginData.APP_ID,
        appName: PluginData.APP_NAME,
        appVersion: PluginData.APP_VERSION,
        host: "127.0.0.1",
        port: 26538
    }

    constructor() {
        super();
        try {
            PearDesktopPlugin._COMPANION = new CompanionConnector(PearDesktopPlugin._DEFAULT_SETTINGS);
            PearDesktopPlugin._SOCKET = new PearSocketClient({host: '127.0.0.1', port: 26538});
            PearDesktopPlugin._REST = new PearRestClient({host: '127.0.0.1', port: 26538});
            PearDesktopPlugin._SOCKET.connect();
        } catch (e) {
            console.error(e);
            this.logMessage(`Error while connecting. error: ${JSON.stringify(e)}`);
        }
        new PlayPauseAction(this, ActionTypes.PLAY_PAUSE);
        new NextPrevAction(this, ActionTypes.NEXT_TRACK, 'NEXT');
        new NextPrevAction(this, ActionTypes.PREV_TRACK, 'PREV');
        new VolChangeAction(this, ActionTypes.VOLUME_DOWN, 'DOWN');
        new VolChangeAction(this, ActionTypes.VOLUME_UP, 'UP');
        new MuteAction(this, ActionTypes.VOLUME_MUTE);
        new LikeDislikeAction(this, ActionTypes.LIKE_TRACK, LikeStatus.LIKE);
        new LikeDislikeAction(this, ActionTypes.DISLIKE_TRACK, LikeStatus.DISLIKE);
        new SongInfoAction(this, ActionTypes.SONG_INFO);
        new ShuffleAction(this, ActionTypes.SHUFFLE);
        new RepeatAction(this, ActionTypes.REPEAT);
        new PlayPlaylistAction(this, ActionTypes.PLAY_PLAYLIST);
    }

    private static _COMPANION: CompanionConnector;
    private static _SOCKET: PearSocketClient;
    private static _REST: PearRestClient;
    private startupAuthorizationAttempted = false;
    private startupAuthorizationRetry?: ReturnType<typeof setTimeout>;
    private startupAuthorizationRetries = 0;
    private readonly maxStartupAuthorizationRetries = 12;

    public static get COMPANION(): CompanionConnector {
        return this._COMPANION;
    }

    public static get SOCKET(): PearSocketClient {
        return this._SOCKET;
    }

    public static get REST(): PearRestClient {
        return this._REST;
    }

    @SDOnActionEvent('didReceiveGlobalSettings')
    globalSettingsReceived({payload: {settings},}: DidReceiveGlobalSettingsEvent<GlobalSettingsInterface>) {
        if (settings && Object.keys(settings).length >= 1) {
            PearDesktopPlugin.COMPANION.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: VERSION,
                host: settings.host,
                port: parseInt(settings.port),
                token: settings.token
            };
            PearDesktopPlugin.SOCKET.setSettings({
                host: settings.host,
                port: parseInt(settings.port),
                token: settings.token,
            });
            PearDesktopPlugin.REST.setSettings({
                host: settings.host,
                port: parseInt(settings.port),
                token: settings.token,
            });
            PearDesktopPlugin.SOCKET.connect();

            if (!this.startupAuthorizationAttempted) {
                this.startupAuthorizationAttempted = true;
                void this.authorizeAtStartup(settings.host, parseInt(settings.port));
            }
        } else {
            // If no settings are provided, use the default settings
            PearDesktopPlugin.COMPANION.settings = PearDesktopPlugin._DEFAULT_SETTINGS;

            if (!this.startupAuthorizationAttempted) {
                this.startupAuthorizationAttempted = true;
                void this.authorizeAtStartup(PearDesktopPlugin._DEFAULT_SETTINGS.host, PearDesktopPlugin._DEFAULT_SETTINGS.port);
            }
        }
    }

    private async authorizeAtStartup(host: string, port: number): Promise<void> {
        try {
            const response = await fetch(
                `http://${host === 'localhost' ? '127.0.0.1' : host}:${port}/auth/${encodeURIComponent(PluginData.APP_ID)}`,
                {method: 'POST'},
            );
            const result = await response.json() as {accessToken?: string};

            if (!response.ok || !result.accessToken) {
                throw new Error(`Authorization request failed (${response.status})`);
            }

            this.startupAuthorizationRetries = 0;
            PearDesktopPlugin.COMPANION.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: VERSION,
                host,
                port,
                token: result.accessToken,
            };
            PearDesktopPlugin.SOCKET.setSettings({host, port, token: result.accessToken});
            PearDesktopPlugin.REST.setSettings({host, port, token: result.accessToken});
            this.setGlobalSettings({host, port: port.toString(), token: result.accessToken});
            PearDesktopPlugin.SOCKET.connect();
        } catch (error) {
            this.logMessage(`Startup authorization failed: ${JSON.stringify(error)}`);
            if (this.startupAuthorizationRetries < this.maxStartupAuthorizationRetries) {
                this.startupAuthorizationRetries += 1;
                this.startupAuthorizationRetry = setTimeout(() => {
                    void this.authorizeAtStartup(host, port);
                }, 5000);
            }
        }
    }
}

export {PearDesktopPlugin as YTMD};

new PearDesktopPlugin();
