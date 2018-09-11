
# react-native-phone

Simple phone application based on react-native

## Prerequisites
- [NodeJS 10+](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- Android and/or IOS developer tools

If you are going to use Windows 10 use WSL (linux subsystem) to run build tools to avoid possible issues. Install Ubuntu or another linux from Store and run as admin in PowerShell terminal `Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux`. 

## Install dependencies
 - Install react-native cli tools `npm install -g expo-cli exp react-native-cli`
 - Install dependencies by `npm install` or `yarn`
 - Run `react-native link` to link plugins with projects


## Prepare backend web application

#### Via Heroku 1-click deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BandwidthExamples/react-native-phone/tree/develop)

#### Via docker

Run `PORT=<PORT> docker-compose up -d`. Use any port as <PORT> port value. This port should be external accessible via `ngrok` or any frontend web server like `nginx`, `caddy`, etc with configured https access.

#### Manual

Go to directory `backend`

Start the app with `PORT=<PORT> npm start`. Use any port as <PORT> port value. This port should be external accessible via `ngrok` or any frontend web server like `nginx`, `caddy`, etc with configured https access.

Remember URL of started web app. It will be required later.

## Configure Push notifications (Android only)

You should configure Firebase Cloud Messaging to enable push notifications on Android devices. Read [here](https://docs.expo.io/versions/latest/guides/using-fcm) for more details. Save generated file `google-services.json` in project directory (overwrite exisiting file).


## Building a mobile app

```sh
exp login # to login on expo.io

exp build:android # to build Android app
exp build:ios # to build IOS app

```

Read [here](https://docs.expo.io/versions/v29.0.0/distribution/building-standalone-apps) for more details.

## Running

Install mobile app on the phone. Run it. Enter your Bandwidth auth data and url to backend web app in login page and press `Log in`. After that you can make call, send messages. Switch to tab "Settings" to see asiggned phone number and sip uri.