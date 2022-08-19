import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AculabCloudClient from 'aculab-webrtc';
import './App.css';

import { RegisterComponent } from './components/RegisterComponent';
import { CallComponent } from './components/CallComponent';
import { unRegResponse, User } from './types';

const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [client, setClient] = useState<any>();
  const [user, setUser] = useState<User>();

  // create socket
  if (!socket) {
    socket = io(SOCKET_CONNECT_URL);
  }

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

  function unregister() {
    if (client) {
      client.disableIncoming();
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
        <CallComponent socket={socket} client={client} user={user} />
      )}
    </div>
  );
}

export default App;
