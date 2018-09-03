
# react-native-phone

Simple phone application based on react-native

## Prerequisites
- [NodeJS 10+](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- Android an/or IOS developer tools

If you are going to use Windows use WSL (linux subsystem) to run build tools to avoid possible issues.

## Install
 - Install react-native cli tools `npm install -g expo-cli exp react-native-cli`
 - Install dependencies by `npm install` or `yarn`

## Prepare backend web application

#### Via Heroku 1-click deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/BandwidthExamples/react-native-phone/tree/develop)

#### Via docker

Run `PORT=<PORT> docker-compose up -d`. Use any port as <PORT> port value. This port should be external accessible via `ngrok` or any frontend web server like `nginx`, `caddy`, etc with configured https access.

#### Manual

Go to directory `backend`

Start the app with `PORT=<PORT> npm start`. Use any port as <PORT> port value. This port should be external accessible via `ngrok` or any frontend web server like `nginx`, `caddy`, etc with configured https access.

Remember URL of started web app. It will be required later.

## Running

Install mobile app on the phone. Run it. Enter your Bandwidth auth data and url to backend web app in login page and press `Log in`. After that you can make call and receive incoming calls. Switch to tab "Settings" to see asiggned phone number and sip uri.