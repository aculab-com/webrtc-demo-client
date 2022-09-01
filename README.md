# WebRTC Demo Client

WebRTC Demo Client is a React application designed to be user with [AculabCall-notification-server](https://github.com/aculab-com/AculabCall-notification-server).

This app allows testing of calls client to client using notifications and demonstrates use of [aculab-webrtc](https://github.com/aculab-com/aculab-webrtc) in frontend application with implication of a server and notifications.

This app uses sockets.io for communication with AculabCall-notification-server.

**This client requires the AculabCall-notification-server to be running.**

## Install

In the root folder run:

```terminal
npm install
```

## Connect to server using sockets

In app.tsx file change SOCKET_CONNECT_URL to your server url:port e.g. 'http://localhost:3500'

## Sockets data

### Emit data

example of emitting data:

```ts
socket.emit(
  'unregister_user',
  user?.username,
  (response: unRegResponse) => {
    console.log('unregister user response', response);
  }
);
```

#### 'register'

argument: an object {username: string, logLevel: string}  
callback:  
if error returns an object

```ts
{
  status: 'error',
  data: {
    message: string
  }
}
```

if success returns an object

```ts
{
  status: 'userCreated',
  data: {
    username: string,
    webrtcToken: string,
    webrtcAccessKey: string,
    cloudRegionId: string,
    logLevel: string
  }
}
```

#### 'unregister_user'

argument: username as string  
callback: returns an object

```ts
{
  status: string,
  message: string
}
```

#### 'call_notification'

argument: an object

```ts
{
  uuid: string,
  caller: string,
  callee: string,
}
```

callback: returns a string

#### 'call_canceled'

argument: an object

```ts
{
  uuid: string,
  caller: string,
  callee: string,
  call_cancelled: boolean
}
```

callback: returns an object

```ts
{
  message: string
}
```

### Receive data

example of receiving data:

```ts
socket.on('silent_notification', async (data) => {
  if (call) {
    if (data.call_cancelled) {
      // Call cancelled
    } else if (data.call_rejected) {
      // Call rejected
    } else {
      // Start a call
    }
  }
});
```

#### 'silent_notification'

receiving data: an object

```ts
{
  uuid: string,
  caller: string,
  callee: string,
  webrtc_ready?: string,
  call_rejected?: string,
  call_cancelled?: string,
}
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## License

MIT

Copyright (c) 2022 Aculab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
