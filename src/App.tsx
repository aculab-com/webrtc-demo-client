import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

const SOCKET_CONNECT_URL = 'http://localhost:3500';
let socket: Socket;

function App() {
  const[username, setUsername] = useState('');

  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_CONNECT_URL);
      socket.on('response', (data) => {
        console.log('1111 server response to registration', data);
      })
    };
  }, []);

  const register = () => {
    let logLevel = document.getElementById('logLevel') as HTMLSelectElement;
    let data = { username: username, logLevel: logLevel.value}
    console.log('registering user:', data);
    socket.emit('register', data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='App-title'>WebRTC Demo</h1>
      </header>
      <div className='logIn'>
        <div className='inputs'>
          <input
            id="username"
            type="text"
            placeholder='Username...'
            onChange={(event) => {setUsername(event.target.value)}}
          />
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
      <button onClick={register}>Register</button>
      </div>
    </div>
  );
}

export default App;
