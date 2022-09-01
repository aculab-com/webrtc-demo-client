import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AculabCloudClient from 'aculab-webrtc';

import './App.css';
import { RegisterComponent } from './components/RegisterComponent';
import { CallComponent } from './components/CallComponent';
import { unRegResponse, User } from './types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ringing from './media/ringing.wav';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ringback from './media/ringback.wav';

/**
 * constant holding url to server for socket.io communication
 */
const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

/**
 * main application
 * @returns component
 */
function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [client, setClient] = useState<any>();
  const [user, setUser] = useState<User>();
  const [playRing, setPlayRing] = useState(false);
  const [playRingback, setPlayRingback] = useState(false);

  // create socket
  if (!socket) {
    socket = io(SOCKET_CONNECT_URL);
  }

  // create AculabCloudClient instance for WebRTC use
  useEffect(() => {
    // server response to registering new user
    if (user && !client) {
      const newClient = new AculabCloudClient(
        user.cloudRegionId,
        user.webrtcAccessKey,
        user.username,
        user.logLevel
      );

      // if newClient, set up for incoming call and store newClient in client state
      if (newClient) {
        newClient.enableIncoming(user.webrtcToken);
        setClient(newClient);
      }
    }
  }, [user]);

  // handles ringing and ringback
  useEffect(() => {
    const player = document.getElementById('ringPlayer') as HTMLAudioElement;
    player.loop = true;
    if (player && playRing) {
      // inbound call
      player.src = ringing;
      player.load();
      player.play().catch((err) => {
        console.error('Play ringing error:', err);
      });
    } else if (player && playRingback) {
      // outbound call
      player.src = ringback;
      player.load();
      player.play().catch((err) => {
        console.error('Play ringing error:', err);
      });
    } else {
      player.pause();
    }
  }, [playRing, playRingback]);

  /**
   * unregister client locally and on the server.\
   * it uses socket to delete registered user from the server.
   */
  function unregister() {
    if (client) {
      client.disableIncoming();
      // emit to server via socket
      socket.emit(
        'unregister_user',
        user?.username,
        (response: unRegResponse) => {
          console.log('unregister user response', response);
        }
      );
      setClient(undefined);
      setUser(undefined);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Aculab WebRTC Demo</h1>
        <audio id="ringPlayer" />
        {!client ? (
          <div>
            <b>Registration</b>
          </div>
        ) : (
          <div>
            <button className="unregisterButton" onClick={unregister}>
              Unregister
            </button>
            <b>Registered Client: {user?.username}</b>
          </div>
        )}
      </header>
      {!client ? (
        <RegisterComponent socket={socket} setUser={setUser} />
      ) : (
        <CallComponent
          socket={socket}
          client={client}
          user={user}
          setPlayRing={setPlayRing}
          setPlayRingback={setPlayRingback}
        />
      )}
    </div>
  );
}

export default App;
