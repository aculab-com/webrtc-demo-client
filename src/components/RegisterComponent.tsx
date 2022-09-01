import { useState } from 'react';
import { RegisterProps, RegResponse, User } from '../types';
import { capitalizeFirstLetter } from './helperFunctions';

/**
 * Register component
 * @param {RegisterProps} props object with parameters socket and setUser
 * @returns component
 */
export const RegisterComponent = (props: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [registerPressed, setRegisterPressed] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const socket = props.socket;

  /**
   * Register client on the server via socket
   * @param {string} username client name to register in server db and WebRTC
   * @param {string} logLevel number 0-6: 0 = no log, 6 = log everything
   */
  function register(username: string, logLevel: string) {
    const data = { username: username, logLevel: logLevel };
    socket.emit('register', data, (response: RegResponse) => {
      switch (response.status) {
        case 'userCreated':
          props.setUser(response.data as User);
          break;
        case 'error':
          setWarningMessage(capitalizeFirstLetter(response.data.message));
      }
    });
  }

  return (
    <div className="popUpUiWrapper">
      <div className="inputs">
        <input
          id="username"
          type="text"
          placeholder="Username..."
          onChange={(event) => {
            setUsername(event.target.value);
            setWarningMessage('');
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
          </select>
        </div>
      </div>
      <button
        className="mainScreenButton"
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
