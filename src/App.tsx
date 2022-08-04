import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

function App() {
  // const [username, setUsername] = useState('');
  // const [registerPressed, setRegisterPressed] = useState(false);
  const [client, setClient] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_CONNECT_URL);
      socket.on('response', (data) => {
        console.log('1111 server response to registration', data);
      });
    }
  }, []);

  const register = (username: string) => {
    if (username) {
      const logLevel = document.getElementById('logLevel') as HTMLSelectElement;
      const data = { username: username, logLevel: logLevel.value };
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
              <br></br>
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
            setRegisterPressed(true);
            register(username);
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
        <h1 className="App-title">WebRTC Demo</h1>
      </header>
      {!client ? (
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
