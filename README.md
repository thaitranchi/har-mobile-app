# Heritage at Risk

Heritage at Risk is a React Native mobile app for capturing and submitting heritage risk reports. The repository contains the mobile client, design assets, and the original mission requirements.

## Repository Layout

- `HeritageAtRisk/`: React Native application source
- `waypoints.md`: original project specification and mission waypoints
- `*.png`, `*.jpg`, `*.gif`, `*.svg`: storyboard and UI reference assets

## Current App Status

The app currently includes:

- a connection screen with email/password validation and password visibility toggle
- local persistence for session, reports, and settings
- a report list screen with queued/stored status handling
- a settings drawer for sync and GPS-related preferences
- report creation and submission flows implemented as a development-safe baseline
- API request signing helpers for the documented `X-API-Key` and `X-API-Sig` headers

The current implementation does not yet include full native camera, map, or geolocation wiring. Those parts are represented by a safe simulated flow in the app shell until the native integrations and credentials are configured.

## Requirements

The original functional requirements were moved to [waypoints.md](./waypoints.md).

## Setup

Prerequisites:

- Node.js
- npm
- React Native Android/iOS toolchain as required by React Native `0.62.2`

Install dependencies:

```bash
cd HeritageAtRisk
npm install
```

Run tests:

```bash
cd HeritageAtRisk
.\node_modules\.bin\jest.cmd --runInBand
```

Start Metro:

```bash
cd HeritageAtRisk
npm start
```

Run Android:

```bash
cd HeritageAtRisk
npm run android
```

Run iOS:

```bash
cd HeritageAtRisk
npm run ios
```

## API Credentials

To connect the app to the remote API, set the consumer credentials in:

- `HeritageAtRisk/App.js`

Update `API_CONFIG.consumerKey` and `API_CONFIG.consumerSecret` before testing real authentication and report synchronization against `api.heobs.org`.
