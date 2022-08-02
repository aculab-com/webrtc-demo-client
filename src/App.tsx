import React from 'react';
import './App.css';
// import InputField from './components/InputField';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className='App-title'>WebRTC Demo</h1>
      </header>
      <div className='logIn'>
        <div className='inputs'>
          <div>
            {/* <label htmlFor="username">Username:</label> */}
            <input id="username" type="text" placeholder='Username...' />
          </div>
          <div className='logLevel'>
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
      <button>Register</button>
      </div>
    </div>
  );
}

export default App;
