import {YTMDPi} from '../../pear-desktop-pi';
import {PisAbstract} from '../pis.abstract';
import {DidReceiveSettingsEvent} from "streamdeck-typescript";
import {PlayPauseSettings} from "../../interfaces/context-settings.interface";

export class PlayPausePi extends PisAbstract {
    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        super(pi, context, sectionElement);
        this.pi.saveElement.onclick = () => this.saveSettings();
        pi.requestSettings();
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlayPauseSettings>): void {
        this.pi.actionElement.value = settings.action ?? "TOGGLE";
        this.pi.encoderModeElement.value = settings.encoderMode ?? "SEEK";
        this.pi.displayFormatElement.value = settings.displayFormat ?? "{current}";
        this.pi.displayTitleFormatElement.value = settings.displayTitleFormat ?? "{title}";
        this.pi.customLayoutElement.value = settings.customLayout ?? "";

    }

    private saveSettings() {
        const action = this.pi.actionElement.value,
            encoderMode = this.pi.encoderModeElement.value,
            displayFormat = this.pi.displayFormatElement.value,
            displayTitleFormat = this.pi.displayTitleFormatElement.value,
            customLayout = this.pi.customLayoutElement.value;

        this.settingsManager.setContextSettingsAttributes(this.context, {
            action: action ?? "TOGGLE",
            encoderMode: encoderMode === "TRACK_NAVIGATION" ? "TRACK_NAVIGATION" : "SEEK",
            displayFormat: displayFormat ?? "{current}",
            displayTitleFormat: displayTitleFormat ?? "{title}",
            customLayout: customLayout ?? ""
        });
    }
}
