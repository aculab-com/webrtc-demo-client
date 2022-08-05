import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AculabCloudClient from 'aculab-webrtc';
import './App.css';

const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function App() {
  const [user, setUser] = useState();
  const [client, setClient] = useState();
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_CONNECT_URL);
      socket.on('register_user_response', (data) => {
        console.log('1111 server response to registration', data);
        if (data.username) {
          setUser(data);
          console.log(
            'data for AculabCloudClient',
            data.cloudRegionId,
            data.webrtcAccessKey,
            data.username,
            data.logLevel
          );
          // setClient(
          //   new AculabCloudClient(
          //     data.cloudRegionId,
          //     data.webrtcAccessKey,
          //     data.username,
          //     data.logLevel
          //   )
          // );
          console.log('user:', user);
        } else {
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
      {!user ? (
        <RegisterComponent />
      ) : (
        <div>
          <br></br>
        </div>
      )}
    </div>
  );
}

export default App;
