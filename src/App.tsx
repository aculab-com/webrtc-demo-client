import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AculabCloudClient from 'aculab-webrtc';
import './App.css';

const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

/**
 * Convert first letter to upper case
 * @param {string} string any string
 * @returns {string} string with first letter in upper case
 */
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function App() {
  const [user, setUser] = useState();
  const [client, setClient] = useState();
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (!socket) {
      // create socket
      socket = io(SOCKET_CONNECT_URL);
      // server response to registering new user
      socket.on('register_user_response', (data) => {
        // user registered on server
        if (data.username) {
          setUser(data);
          // create new AculabCloudClient
          setClient(
            new AculabCloudClient(
              data.cloudRegionId,
              data.webrtcAccessKey,
              data.username,
              data.logLevel
            )
          );
        } else {
          // if user not registered, display server response
          setWarningMessage(capitalizeFirstLetter(data.message));
        }
      });
    }
  }, []);

  const register = (username: string, logLevel: string) => {
    if (username) {
      const data = { username: username, logLevel: logLevel };
      console.log('registering user:', data);
      socket.emit('register', data);
    }
  };

  const RegisterComponent = () => {
    const [username, setUsername] = useState('');
    const [registerPressed, setRegisterPressed] = useState(false);
    return (
      <div className="logIn">
        <div className="inputs">
          <input
            id="username"
            type="text"
            placeholder="Username..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          {!username && registerPressed ? (
            <div>
              <b>Username is required</b>
            </div>
          ) : (
            <div>
              <b>{warningMessage}</b>
            </div>
          )}
          <div>
            <label htmlFor="logLevel">Log Level:</label>
            <select name="logLevel" id="logLevel">
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            const logLevel = document.getElementById(
              'logLevel'
            ) as HTMLSelectElement;
            setRegisterPressed(true);
            setWarningMessage('');
            register(username, logLevel.value);
          }}
        >
          Register
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Aculab WebRTC Demo</h1>
      </header>
      {!client ? (
        <RegisterComponent />
      ) : (
        <div>
          <button onClick={() => console.log('this is client:', client)}>
            Press me
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
