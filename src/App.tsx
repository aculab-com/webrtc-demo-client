import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AculabCloudClient from 'aculab-webrtc';
import './App.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ringing from './media/ringing.wav';
import video_placeholder from './media/video_placeholder.png';

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

type User = {
  username: string;
  webrtcToken: string;
  webrtcAccessKey: string;
  cloudRegionId: string;
  logLevel: string | number;
};

type Client = {
  _aculabIceServers: Array<Record<string, unknown>>;
  _calls: Set<[]>;
  _clientId: string;
  _cloud: string;
  _option_request: any;
  _option_request_refresh_timer: number;
  _reconnecting: boolean;
  _registerer: any;
  _token: string;
  transport_connected: boolean;
  _ua: any;
  _ua_started: boolean;
  _webRtcAccessKey: string;
  iceServers: any;
  loglevel: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  makeOutgoing: Function;
  maxConcurrent: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onIncoming: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onIncomingState: Function;
};

type Call = {
  [x: string]: any;
  _callId: string;
  _connected: boolean;
  _disconnect_called: boolean;
  _ice_connected: boolean;
  _notified_connected: boolean;
  _notified_remote_stream: boolean;
  _remote_stream: boolean;
  _session: boolean;
  _termination_reason: string;
  answer_pending: false;
  client: Client;
  onConnected: any;
  onConnecting: any;
  onDisconnect: any;
  onLocalVideoMute: any;
  onLocalVideoUnmute: any;
  onMedia: any;
  onRemoteVideoMute: any;
  onRemoteVideoUnmute: any;
};

type InboundCallObj = {
  call: Call;
  from: string;
  type: 'client' | 'service';
  offeringAudio: boolean;
  offeringVideo: boolean;
  canReceiveAudio: boolean;
  canReceiveVideo: boolean;
};

type WebRtcStatus = 'idle' | 'gotMedia' | 'connecting' | 'connected';

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [client, setClient] = useState<any>();
  const [user, setUser] = useState<User>();
  const [warningMessage, setWarningMessage] = useState('');
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState('');
  const [displayVideo, setDisplayVideo] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [call, setCall] = useState<any>();
  const [webRtcStatus, setWebRtcStatus] = useState<WebRtcStatus>('idle');

  const callOptions = {
    constraints: {
      audio: true,
      video: true,
    },
    receiveAudio: true,
    receiveVideo: true,
  };

  useEffect(() => {
    if (!socket) {
      // create socket
      socket = io(SOCKET_CONNECT_URL);
      // server response to registering new user
      socket.on('register_user_response', async (data) => {
        // user registered on server
        if (data.username) {
          setUser(data);
          // create new AculabCloudClient
          const newClient = new AculabCloudClient(
            data.cloudRegionId,
            data.webrtcAccessKey,
            data.username,
            data.logLevel
          );

          // if newClient, set up for incoming call and store newClient in client state
          if (newClient) {
            newClient.enableIncoming(data.webrtcToken);
            newClient.onIncoming = newCall;
            newClient.onIncomingState = incomingState;
            setClient(newClient);
          }
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

  function incomingState(state: undefined) {
    console.log('incomingState', state);
  }

  function answerCall() {
    if (incomingCall && !callConnected) {
      console.log('accepting inbound');
      setDisplayVideo(true);
      call.answer(callOptions);
    } else {
      console.log('not starting call - call in progress');
    }
  }

  function stop_call() {
    console.log('stopping call');
    if (call) {
      // if inbound and not accepted, use reject instead
      if (incomingCall && !displayVideo) {
        call.reject(486);
      } else {
        call.disconnect();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function newCall(obj: InboundCallObj) {
    console.log('newCall fired up', obj.call);
    console.log('newCall fired up 222', obj);
    setCallerId(obj.from);
    setIncomingCall(true);

    // Set up callbacks
    obj.call.onDisconnect = callDisconnected;
    obj.call.onMedia = gotMedia;
    obj.call.onConnecting = connecting;
    obj.call.onConnected = connected;

    // Play a ringing to notify user of the call
    // get the HTMLMediaElement element
    const player = document.getElementById('player') as HTMLAudioElement;
    if (player.canPlayType('audio/wav')) {
      player.loop = true;
      player.src = ringing;
      player.load();
      player.play().catch((err) => {
        console.log('Play ringing error:', err);
      });
    } else {
      // Browser can't play audio/wav
    }

    // Send ringing notification to the caller
    obj.call.ringing();
    setCall(obj.call);
  }

  function connecting(obj: any) {
    const localPlayer = document.getElementById(
      'localPlayer'
    ) as HTMLVideoElement;
    console.log('connecting', obj);
    setWebRtcStatus('connecting');
    localPlayer.srcObject = obj.stream;
    localPlayer.load();
    localPlayer.play().catch((err) => {
      console.error(err);
    });
  }

  function gotMedia(obj: any) {
    console.log('gotMedia', obj);
    // console.log('player', player);
    const player = document.getElementById('player') as HTMLVideoElement;
    setWebRtcStatus('gotMedia');
    console.log('player', player);
    if (player) {
      player.pause();
      player.src = '';
      player.srcObject = null;
      player.load();
      // reset the player size
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      player.parentElement!.classList.remove('muted');
      // slot_obj.playing_ringing = false;
      // slot_obj.gotremotestream = false;
      if (obj) {
        // slot_obj.gotremotestream = true;
        player.srcObject = obj.stream;
        player.load();
        const p = player.play();
        if (p !== undefined) {
          p.catch((error) => {
            console.log(error);
          });
        }
      }
    }
  }

  function connected(obj: any) {
    console.log('connected', obj);
    setWebRtcStatus('connected');
    setCallConnected(true);
    setIncomingCall(false);
  }

  function callDisconnected(obj: any) {
    console.log('callDisconnected', obj);
    setWebRtcStatus('idle');
    setCallConnected(false);
    setDisplayVideo(false);
    setCall(null);
    handle_disconnect();
  }

  function handle_disconnect() {
    if (call != null) {
      call.disconnect();
      setCall(null);
    }
    gotMedia(null);
    const localPlayer = document.getElementById(
      'localPlayer'
    ) as HTMLVideoElement;
    localPlayer.pause();
    localPlayer.src = '';
    localPlayer.srcObject = null;
    localPlayer.load();
  }

  const RegisterComponent = () => {
    const [username, setUsername] = useState('');
    const [registerPressed, setRegisterPressed] = useState(false);
    return (
      <div className="popUpUiWrapper">
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

  const CallDisplay = () => {
    const [callId, setCallId] = useState('');
    const [callPressed, setCallPressed] = useState(false);

    return (
      <div className="popUpUiWrapper">
        <div className="inputs">
          <input
            id="callId"
            type="text"
            placeholder="Call ID..."
            onChange={(event) => {
              setCallId(event.target.value);
            }}
          />
          {!callId && callPressed ? (
            <div>
              <b>Username is required</b>
            </div>
          ) : (
            <div>
              <b>{warningMessage}</b>
            </div>
          )}
          <div>
            <label htmlFor="callType">Call:</label>
            <select name="callType" id="callType">
              <option value="client">Client</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>
        <button
          className="mainScreenButton"
          onClick={() => {
            setCallPressed(true);
            console.log('call pressed');
            console.log('user', user);
            console.log('client', client);
          }}
        >
          Call
        </button>
        <audio id="ringPlayer"></audio>
      </div>
    );
  };

  type IncomingCall = {
    caller: string;
  };

  const IncomingPopUp = (props: IncomingCall) => {
    return (
      <div
        className={
          incomingCall
            ? 'incomingCallWrapper-unfolded'
            : 'incomingCallWrapper-folded'
        }
      >
        <div className="incomingCallText">
          <b>{props.caller} is calling</b>
        </div>
        <div className="incomingCallButtonWrap">
          <button
            className="incomingCallButton"
            style={{ backgroundColor: 'green' }}
            onClick={() => {
              console.log('incoming call accepted');
              answerCall();
              setIncomingCall(false);
            }}
          >
            Accept
          </button>
          <button
            className="incomingCallButton"
            style={{ backgroundColor: 'red' }}
            onClick={() => {
              console.log('incoming call rejected');
              setIncomingCall(false);
              stop_call();
            }}
          >
            Reject
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Aculab WebRTC Demo</h1>
        {!client ? (
          <b>Registration</b>
        ) : (
          <b>Registered Client: {user?.username}</b>
        )}
      </header>
      <IncomingPopUp caller={callerId} />
      {!client ? (
        <RegisterComponent />
      ) : !displayVideo ? (
        <CallDisplay />
      ) : (
        <div></div>
      )}
      <div
        className="videoDisplayWindow"
        style={!displayVideo ? { display: 'none' } : {}}
      >
        <div className="videoDisplayWrapper">
          <div className="videoDisplay">
            <video id="player" poster={video_placeholder}></video>
          </div>
          <div className="videoDisplay">
            <video id="localPlayer" poster={video_placeholder}></video>
          </div>
        </div>
        <div className="videoDisplayStatsWrap">
          <div className="videoDisplayStat">
            <b>Calling: {callerId}</b>
          </div>
          <div className="videoDisplayStat">
            <b>Call Status: {webRtcStatus}</b>
          </div>
        </div>
        <div className="videoButtonsWrap">
          <button
            className="videoButton"
            onClick={() => {
              console.log('mute video pressed');
            }}
          >
            Mute Video
          </button>
          <button
            className="videoButton"
            onClick={() => {
              console.log('mute audio pressed');
            }}
          >
            Mute Audio
          </button>
          <button
            className="videoButton"
            style={{ backgroundColor: 'red' }}
            onClick={() => {
              console.log('incoming call rejected');
              setIncomingCall(false);
              stop_call();
            }}
          >
            Hang Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
