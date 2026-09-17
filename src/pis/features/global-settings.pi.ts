import {ErrorOutput, SocketState} from "ytmdesktop-ts-companion";
import {YTMDPi} from "../../pear-desktop-pi";
import {PluginData} from "../../shared/plugin-data";
import {GlobalSettingsInterface} from "../../interfaces/global-settings.interface";
import {getCompanionConnector} from "../services/companion-singleton";
import {PearSocketClient} from '../../services/pear-socket-client';

export class GlobalSettingsPi {
    private authToken: string = '';
    private static socketListenersAttached = false;
    private static lastSettingsKey = '';
    private autoAuthorizationAttempted = false;
    private authRetryTimer: number | undefined;
    private authRetryCount = 0;
    private readonly maxAuthRetries = 3;
    private socket = new PearSocketClient({host: '127.0.0.1', port: 26538});

    constructor(private pi: YTMDPi) {
        this.pi.globalAuthButtonElement.onclick = () => this.startAuthorization();
        this.pi.globalSaveElement.onclick = () => this.saveSettings();
        this.pi.requestGlobalSettings();
    }

    public newGlobalSettingsReceived(): void {
        let settings = this.pi.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (Object.keys(settings).length < 2)
            settings = {host: '127.0.0.1', port: '26538', token: ''};

        const {
            host = '127.0.0.1',
            port = '26538',
            token = '',
        } = settings as GlobalSettingsInterface;

        this.pi.globalHostElement.value = host;
        this.pi.globalPortElement.value = port;
        this.authToken = token;

        this.setAuthStatusMessage(
            token ? this.pi.getLangString("AUTH_STATUS_CONNECTED") : this.pi.getLangString("AUTH_STATUS_NOT_CONNECTED"),
            token ? 'green' : 'red'
        );
        this.pi.globalSettingsDetailsElement.open = !token;

        if (!token && !this.autoAuthorizationAttempted) {
            this.autoAuthorizationAttempted = true;
            this.scheduleAuthorizationRetry(2000);
        }

        this.ensureSocketClient(host, port, token);
        this.refreshConnectionStatus();
    }

    private scheduleAuthorizationRetry(delayMs = 5000) {
        if (this.authRetryTimer) {
            window.clearTimeout(this.authRetryTimer);
        }
        this.authRetryTimer = window.setTimeout(() => {
            void this.startAuthorization(true);
        }, delayMs);
    }

    private async refreshConnectionStatus() {
        const settings = this.pi.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (!settings?.token) {
            this.setConnectionStatus(
                this.pi.getLangString("CONNECTION_STATUS_AUTH_REQUIRED"),
                'red'
            );
            return;
        }

        this.ensureSocketClient(settings.host, settings.port, settings.token);
    }

    private setAuthStatusMessage(text: string, color: string) {
        this.pi.globalAuthStatusElement.innerText = text;
        this.pi.globalAuthStatusElement.style.color = color;
    }

    private setConnectionStatus(text: string, color: string) {
        this.pi.globalConnectionStatusElement.innerText = text;
        this.pi.globalConnectionStatusElement.style.color = color;
    }

    private getRetrySeconds(message?: string) {
        if (!message) return 5;
        const match = message.match(/retry in (\\d+) seconds?/i);
        if (!match) return 5;
        const seconds = parseInt(match[1], 10);
        if (Number.isNaN(seconds)) return 5;
        return seconds;
    }

    private ensureSocketClient(host: string, port: string, token: string) {
        const normalizedHost = host === 'localhost' ? '127.0.0.1' : host;
        const settingsKey = `${normalizedHost}:${port}:${token ?? ''}`;
        const connector = getCompanionConnector();
        if (GlobalSettingsPi.lastSettingsKey !== settingsKey) {
            connector.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host: normalizedHost,
                port: parseInt(port),
                token
            };
        }
        GlobalSettingsPi.lastSettingsKey = settingsKey;

        if (!GlobalSettingsPi.socketListenersAttached) {
            GlobalSettingsPi.socketListenersAttached = true;
            this.socket.addConnectionStateListener((state: SocketState) => {
                switch (state) {
                    case SocketState.CONNECTING:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_CHECKING"), 'gray');
                        break;
                    case SocketState.CONNECTED:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_CONNECTED"), 'green');
                        break;
                    case SocketState.DISCONNECTED:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
                        break;
                    case SocketState.ERROR:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
                        break;
                    default:
                        break;
                }
            });
            this.socket.addErrorListener((error: any) => {
                this.pi.logMessage(`Connection status check failed: ${JSON.stringify(error)}`);
                if (error satisfies ErrorOutput && error.statusCode === 429) {
                    const seconds = this.getRetrySeconds(error.message);
                    this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_RATE_LIMIT", {seconds}), 'orange');
                    return;
                }
                this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
            });
        }

        if (token) {
            this.socket.setSettings({host: normalizedHost, port: parseInt(port), token});
            this.socket.connect();
        } else {
            this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_AUTH_REQUIRED"), 'red');
        }
    }

    private async startAuthorization(isAutomatic = false) {
        if (this.pi.globalAuthButtonElement.disabled) return;
        if (isAutomatic && this.authRetryCount >= this.maxAuthRetries) return;

        try {
            if (isAutomatic) this.authRetryCount += 1;
            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTING"), 'yellow');

            let host = this.pi.globalHostElement.value;
            const port = this.pi.globalPortElement.value;
            if (host === 'localhost') host = '127.0.0.1';

            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_AUTHORIZING"), 'yellow');
            const response = await fetch(
                `http://${host}:${parseInt(port)}/auth/${encodeURIComponent(PluginData.APP_ID)}`,
                {method: 'POST'},
            );
            const result = await response.json() as {accessToken?: string; message?: string};

            if (response.ok && result.accessToken) {
                this.authToken = result.accessToken;
                this.authRetryCount = 0;
                this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTED"), 'green');
                this.saveSettings();
            } else {
                this.authErrorCatched({
                    message: result.message ?? `Authorization request failed (${response.status})`,
                }, isAutomatic);
            }
        } catch (e) {
            this.authErrorCatched(e, isAutomatic);
        }
    }

    private authErrorCatched(err: any, isAutomatic = false) {
        this.pi.logMessage(`Auth error: ${JSON.stringify(err)}`);
        let msg = "";
        if (err satisfies ErrorOutput) {
            msg = err.message;
        } else {
            msg = JSON.stringify(err);
        }
        if (!this.pi.globalAuthStatusElement) {
            alert(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`);
            return;
        }
        this.setAuthStatusMessage(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`, 'red');
        this.pi.globalSettingsDetailsElement.open = true;

        if (isAutomatic && this.authRetryCount < this.maxAuthRetries) {
            this.scheduleAuthorizationRetry(5000);
        }
    }

    private saveSettings() {
        let host = this.pi.globalHostElement.value,
            port = this.pi.globalPortElement.value;

        if (host == 'localhost') host = '127.0.0.1';

        this.pi.settingsManager.setGlobalSettings({host, port, token: this.authToken});
        this.ensureSocketClient(host, port, this.authToken);
    }
}
