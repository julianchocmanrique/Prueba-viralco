# TEMP360 Project Context

## Repository
- Name: `temp360`
- Remote: `https://github.com/julianchocmanrique/temp360.git`
- Default branch: `main`
- Current local branch (at time of writing): `main`

## Project Purpose
Mobile app (React Native) for recording short 360 event videos with decorative overlays (templates/frames), previewing, and exporting/sharing the final rendered video.

## Tech Stack
- React Native `0.70.6`
- React `18.1.0`
- Navigation:
  - `@react-navigation/native`
  - `@react-navigation/native-stack`
- Media and files:
  - `react-native-image-picker` (video capture)
  - `react-native-video` (preview playback)
  - `ffmpeg-kit-react-native` (video + frame render/export)
  - `react-native-fs` and `react-native-blob-util` (filesystem operations)
- iOS Podfile platform: `12.4`

## App Flow (Current)
1. `Splash` (`src/components/splash/Splash.js`)
2. `Home` (`src/components/home/Home.js`) → immediately redirects to `Record360`
3. `Record360` (`src/components/record360/Record360.js`)
   - user chooses template
   - starts countdown
   - opens camera for video capture
   - copies captured file to app documents path
4. `PreviewConfirm360` (`src/components/home/PreviewConfirm360.js`)
   - loops captured video with selected frame overlay in UI
   - actions: repeat or accept
5. `Preview360` (`src/components/home/Preview360.js`)
   - executes FFmpeg command to burn overlay into output video
   - save and optional share

## Key Files
- Entry and navigation:
  - `index.js`
  - `App.js`
  - `src/components/stack/CoinsStack.js`
- Main feature screens:
  - `src/components/record360/Record360.js`
  - `src/components/home/PreviewConfirm360.js`
  - `src/components/home/Preview360.js`
  - `src/components/home/Home.js`
  - `src/components/splash/Splash.js`
- Assets:
  - `src/assets/frames/` (template frames)
  - `src/assets/` (branding/background images)

## Current Git State Snapshot
- Branches on remote:
  - `main`
  - `prueba1_conexion_backend`
- Recent commits on `main`:
  - `4e5df38` Update Folder
  - `0594796` plantilla ok
  - `2039437` 360 inicio basico

## Build and Run

### Prerequisites
- Node 16 (recommended for RN 0.70.6 consistency)
- Ruby + CocoaPods for iOS
- Xcode + iOS simulator

### Install
```bash
cd temp360
npm install
```

### iOS
```bash
cd ios
pod install
cd ..
npx react-native start --reset-cache
# in another terminal
npx react-native run-ios --simulator "iPad (A16)"
```

### Android
```bash
npx react-native run-android
```

## Backend Integration Status
- No active API integration is implemented in feature screens.
- Current workflow is local capture, local processing, local save/share.
- There is no production `fetch/axios` flow in `src/components` right now.

## iOS Networking / ATS Notes
- `ios/temp360/Info.plist` includes ATS exception for `localhost` insecure HTTP only.
- If future backend uses HTTP with an IP/domain, add ATS exception or migrate to HTTPS.

## Known Operational Notes
- FFmpeg export is the critical path in `Preview360`; failures currently show generic alert.
- `Home` is a redirect-only screen, so real dashboard/home UX is not implemented yet.
- Project contains many media assets; keep repo clean when adding new files to avoid accidental bloat.

## Suggested Next Steps (if continuing development)
1. Add centralized config file for API base URL/environment.
2. Add structured error logs for FFmpeg and file operations.
3. Implement real Home dashboard (instead of redirect) if product requires navigation entry point.
4. Add lightweight QA checklist for video capture/save/share across iOS + Android.

---
This file is intended to be shared with another chat/agent so they can understand the current project state quickly without re-discovery.
