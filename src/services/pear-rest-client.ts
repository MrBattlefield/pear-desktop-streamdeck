type Settings = {host: string; port: number; token?: string};

export class PearRestClient {
    private settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }

    setSettings(settings: Settings) {
        this.settings = settings;
    }

    private async post(path: string, body?: unknown) {
        const response = await fetch(`http://${this.settings.host}:${this.settings.port}/api/v1${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.settings.token ?? ''}`,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`Pear API request failed (${response.status})`);
    }

    playPause() { return this.post('/toggle-play'); }
    play() { return this.post('/play'); }
    pause() { return this.post('/pause'); }
    next() { return this.post('/next'); }
    previous() { return this.post('/previous'); }
    seekTo(seconds: number) { return this.post('/seek-to', {seconds}); }
    goForward(seconds: number) { return this.post('/go-forward', {seconds}); }
    goBack(seconds: number) { return this.post('/go-back', {seconds}); }
    changeVideo(_data: unknown) { return Promise.reject(new Error('Playlist control is not implemented for Pear Desktop yet')); }
    toggleLike() { return Promise.reject(new Error('Like control is not implemented for Pear Desktop yet')); }
    toggleDislike() { return Promise.reject(new Error('Dislike control is not implemented for Pear Desktop yet')); }
    setVolume(_volume: number) { return Promise.reject(new Error('Volume control is not implemented for Pear Desktop yet')); }
    repeatMode(_mode: unknown) { return Promise.reject(new Error('Repeat control is not implemented for Pear Desktop yet')); }
    shuffle() { return Promise.reject(new Error('Shuffle control is not implemented for Pear Desktop yet')); }
}
