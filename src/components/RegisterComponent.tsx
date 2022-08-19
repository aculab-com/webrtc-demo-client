import { useState } from 'react';
import { RegisterProps, RegResponse, User } from '../types';
import { capitalizeFirstLetter } from './helperFunctions';

export const RegisterComponent = (props: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [registerPressed, setRegisterPressed] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const socket = props.socket;

  function register(username: string, logLevel: string) {
    if (username) {
      const data = { username: username, logLevel: logLevel };
      // console.log('registering user:', data);
      socket.emit('register', data, (response: RegResponse) => {
        // console.log('direct register response', response);
        switch (response.status) {
          case 'userCreated':
            props.setUser(response.data as User);
            // console.log('user registered', response.data);
            break;
          case 'error':
            setWarningMessage(capitalizeFirstLetter(response.data.message));
        }
      });
    }
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
