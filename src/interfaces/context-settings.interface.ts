export interface VolumeSettings {
    steps: number;
}

export interface PlayPauseSettings {
    action: 'PLAY' | 'PAUSE' | 'TOGGLE';
    encoderMode?: 'SEEK' | 'TRACK_NAVIGATION';
    displayFormat: string;
    displayTitleFormat: string;
    customLayout: string;
}

export interface PlaylistSettings {
    playlistId?: string;
    playlistUrl?: string;
}
