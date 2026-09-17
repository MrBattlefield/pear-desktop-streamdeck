![Thumbnail](assets/thumbnail/ytmdc-thumbnail.png)

# 1. Table of content
- [1. Table of content](#1-table-of-content)
- [2. Badges](#2-badges)
- [3. What is this Plugin?](#3-what-is-this-plugin)
- [4. Support / Feedback](#4-support--feedback)
- [5. Actions](#5-actions)
- [6. How to use it?](#6-how-to-use-it)
- [7. How to contribute?](#7-how-to-contribute)

# 2. Badges
[![Forks](https://img.shields.io/github/forks/MrBattlefield/pear-desktop-streamdeck?color=blue&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/network/members)
[![Stars](https://img.shields.io/github/stars/MrBattlefield/pear-desktop-streamdeck?color=yellow&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/stargazers)
[![Watchers](https://img.shields.io/github/watchers/MrBattlefield/pear-desktop-streamdeck?color=lightgray&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/watchers)
[![Contributors](https://img.shields.io/github/contributors/MrBattlefield/pear-desktop-streamdeck?color=green&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/graphs/contributors)

[![Issues](https://img.shields.io/github/issues/MrBattlefield/pear-desktop-streamdeck?color=yellow&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/issues)
[![Issues closed](https://img.shields.io/github/issues-closed/MrBattlefield/pear-desktop-streamdeck?color=yellow&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/issues?q=is%3Aissue+is%3Aclosed)

[![Issues-pr](https://img.shields.io/github/issues-pr/MrBattlefield/pear-desktop-streamdeck?color=yellow&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/pulls)
[![Issues-pr closed](https://img.shields.io/github/issues-pr-closed/MrBattlefield/pear-desktop-streamdeck?color=yellow&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/pulls?q=is%3Apr+is%3Aclosed)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/compare)

[![Release](https://img.shields.io/github/release/MrBattlefield/pear-desktop-streamdeck?color=black&style=for-the-badge)](https://github.com/MrBattlefield/pear-desktop-streamdeck/releases)

[![Awesome Badges](https://img.shields.io/badge/badges-awesome-green?style=for-the-badge)](https://shields.io)

# 3. What is this Plugin?
This Stream Deck Plugin allows you to control [Pear Desktop Music Player](https://github.com/XeroxDev/pear-desktop)

> [!NOTE]
> we only support version 2.x.x and above, if you are using an older version, please update to the latest version.

# 4. Support / Feedback
You found a bug? You have a feature request? I would love to hear about it [here](https://github.com/MrBattlefield/pear-desktop-streamdeck/issues/new/choose) or click on the "Issues" tab here on the GitHub repository!

You can also join my discord [here](https://x.xeroxdev.de/s/discord)

# 5. Actions

- Play / Pause Track
- Next Track
- Previous Track
- Like Track
- Dislike Track
- Volume Mute
- Volume Down
- Volume Up
- Track Info
  - Shows a scrolling text for album, title and author
  - Shows the thumbnail of the track
- Shuffle
- Repeat
  - NONE
  - ALL
  - ONE

# 6. How to use it?
> [!NOTE]
> This is just a simplified version. The project documentation will be published with the new repository.

1. Install [Pear Desktop Music Player](https://github.com/XeroxDev/pear-desktop).
2. Install the plugin from [Releases](https://github.com/XeroxDev/Pear-Desktop-StreamDeck/releases) or from the official Stream Deck Store.
3. Add Play/Pause action
4. Insert, if not already correct, the settings for Pear Desktop (for example, host and port).
5. Make sure Pear Desktop and its Companion Server are running.
  - To start the Companion Server, open Pear Desktop settings and select Integrations
   - Go on the left side on the "Integrations" tab
   - Enable the "Companion Server"
6. Turn on "enable companion authorization" under the Companion Server
7. Press the Authorize button in the Play/Pause action settings
8. Compare the authorization code displayed by the plugin with the one displayed in Pear Desktop.
9. If they match, confirm the authorization in Pear Desktop.
10. You are ready to go! (Steps 6-9 are only needed once/when the plugin isn't authorized)

# 7. How to contribute?

Just fork the repository and create PR's.

> [!NOTE]
> We're using [release-please](https://github.com/googleapis/release-please) to optimal release the plugin.
> release-please is following the [conventionalcommits](https://www.conventionalcommits.org) specification.
