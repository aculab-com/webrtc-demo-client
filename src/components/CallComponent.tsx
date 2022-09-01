import { useEffect, useState } from 'react';

import {
  Call,
  CallCompProps,
  InboundCallObj,
  IncomingCall,
  OutboundCall,
  User,
} from '../types';
import { generateUUID } from './helperFunctions';
import { VideoCall } from './VideoCallComponent';

/**
 * Component to place a call to client or server
 * @param {CallCompProps} props object with properties socket, client, user, setPlayRing, setPlayRingback
 * @returns component
 */
export const CallComponent = (props: CallCompProps) => {
  const [displayIncomingUi, setDisplayIncomingUi] = useState(false);
  const [callerId, setCallerId] = useState('');
  const [callingId, setCallingId] = useState('');
  const [displayVideo, setDisplayVideo] = useState(false);
  const [call, setCall] = useState<Call>();
  const [outboundCall, setOutboundCall] = useState<OutboundCall | null>(null);

  const callOptions = {
    constraints: {
      audio: true,
      video: true,
    },
    receiveAudio: true,
    receiveVideo: true,
  };
  const socket = props.socket;
  const user = props.user;
  const client = props.client;

  client.onIncoming = newIncomingCall;
  client.onIncomingState = incomingState;

  // Handle response to silent notifications sent from server via socket
  useEffect(() => {
    // Make sure no more that one listener for silent_notification
    socket.removeListener('silent_notification');

    socket.on('silent_notification', async (data) => {
      if (call) {
        if (data.webrtc_ready) {
          // Do not place second call if a call is in progress
          console.log('only one call allowed');
        } else if (
          (data.call_cancelled || data.call_rejected) &&
          !displayVideo
        ) {
          // Call cancelled or rejected remotely
          stopCall(call, false);
        }
      } else if (data.call_rejected && !displayVideo) {
        // Call rejected before WebRTC communication was established
        setOutboundCall(null);
        props.setPlayRingback(false);
      } else {
        // Start a call
        // Android requires slight delay to prevent connection issues
        // when connection is being establish
        setTimeout(() => {
          placeCall('client', data.callee);
        }, 200);
      }
    });
  }, [call, displayVideo]);

  // Play ringback on outgoing call when WebRTC connection is established
  // but call has not been accepted yet
  useEffect(() => {
    if (!displayVideo && outboundCall) {
      props.setPlayRingback(true);
    }
  }, [displayVideo, outboundCall]);

  /**
   * Use for client.onIncomingState\
   * print out incoming state object
   * @param state object of incoming state
   */
  function incomingState(state: undefined) {
    console.log('incomingState', state);
  }

  /**
   * Answer incoming WebRTC call
   * @param {Call} call call object
   */
  function answerCall(call: Call) {
    call.answer(callOptions);
    setDisplayIncomingUi(false);
    setDisplayVideo(true);
    props.setPlayRing(false);
  }

  /**
   * Reject/Disconnect WebRTC call
   * @param {Call} call call object to be stopped/rejected
   * @param {boolean} rejected if true, call is rejected. Else it is disconnected
   */
  function stopCall(call: Call, rejected: boolean) {
    if (rejected) {
      call.reject(486);
    } else {
      call.disconnect();
    }
    setDisplayIncomingUi(false);
    props.setPlayRing(false);
    props.setPlayRingback(false);
    setCallerId('');
    setCall(undefined);
    setOutboundCall(null);
  }

  /**
   * handle new incoming call
   * @param {InboundCallObj} obj inbound call object
   */
  function newIncomingCall(obj: InboundCallObj) {
    setCallerId(obj.from);
    setDisplayIncomingUi(true);
    props.setPlayRing(true);

    // Send ringing notification to the caller
    obj.call.onDisconnect = callDisconnected;
    obj.call.ringing();
    setCall(obj.call);
  }

  /**
   * Send call notification via socket\
   * Socket response:\
   * 'success' - means callee is mobile phone and notification was successfully sent\
   * 'calling_web_interface' - means callee is web browser\
   * any other response is a problem and it is displayed as alert message
   * @param {string} callee client to receive the call notification
   */
  function sendCallNotification(callee: string) {
    const uuid = generateUUID();
    const data = {
      uuid: uuid,
      caller: (user as User).username,
      callee: callee,
    };
    socket.emit('call_notification', data, (response: string) => {
      if (response === 'success') {
        // calling mobile platform prepare outboundCall object
        setOutboundCall(data as OutboundCall);
      } else if (response === 'calling_web_interface') {
        // calling web browser, place a call do not wait conforming notification
        placeCall('client', data.callee);
      } else {
        // problem occurred
        alert(response);
      }
    });
  }

  /**
   * Send a notification via socket to cancel outbound call\
   * This is needed in case a mobile device received notification of incoming call but WebRTC
   * connection was not been established yet.
   * @param {OutboundCall} outboundCall outbound call object with parameters uuid, caller, callee
   */
  function cancelCallNotification(outboundCall: OutboundCall) {
    const data = outboundCall;
    data.call_cancelled = true;
    socket.emit('call_canceled', data, (response: string) => {
      console.log('call_canceled response', response);
    });
  }

  /**
   * Creates a new call to Client or service
   * @param {'client' | 'service'} type to be called, options are client or service
   * @param {string} callee client or service name to call
   */
  function placeCall(type: 'client' | 'service', callee: string) {
    let newOutboundCall;
    switch (type) {
      case 'client':
        newOutboundCall = client.callClient(
          callee,
          user?.webrtcToken,
          callOptions
        );
        break;
      case 'service':
        newOutboundCall = client.callService(callee);
    }
    setDisplayVideo(true);
    setOutboundCall(null);
    setCall(newOutboundCall);
  }

  /**
   * Use for call.onDisconnect\
   * It stops a call from the parameter disconnected object\
   * If cause of disconnecting differs from NORMAL an alert message with cause is displayed
   * @param obj onDisconnect object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function callDisconnected(obj: any) {
    if (obj.cause !== 'NORMAL') {
      alert(`Call disconnected - reason: ${obj.cause}`);
    }
    stopCall(obj.call, false);
  }

  /**
   * CallDisplay component allows to place a call to user or service
   * @param {string} param0 an object with parameter callingId: string default name to be in Call ID field
   * @returns component
   */
  const CallDisplay = ({ callingId = '' }) => {
    const [callId, setCallId] = useState(callingId);
    const [callPressed, setCallPressed] = useState(false);

    return (
      <div className="popUpUiWrapper">
        <div className="inputs">
          <input
            id="callId"
            type="text"
            placeholder="Call ID..."
            value={callId}
            onChange={(event) => {
              setCallId(event.target.value);
            }}
          />
          {!callId && callPressed ? (
            <div>
              <b>Call ID is required</b>
            </div>
          ) : (
            <div>
              <b />
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
            if (callId) {
              setCallingId(callId);
              sendCallNotification(callId);
            }
          }}
        >
          Call
        </button>
      </div>
    );
  };

  /**
   * Incoming call component\
   * Displayed on incoming Call
   * @param {IncomingCall} props an object with parameter caller: string
   * @returns component
   */
  const IncomingPopUp = (props: IncomingCall) => {
    return (
      <div
        className={
          displayIncomingUi
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
              answerCall(call as Call);
            }}
          >
            Accept
          </button>
          <button
            className="incomingCallButton"
            style={{ backgroundColor: 'red' }}
            onClick={() => {
              stopCall(call as Call, true);
            }}
          >
            Reject
          </button>
        </div>
      </div>
    );
  };

  /**
   * Displays component for when outbound call was triggered but WebRTC connection not established
   * it allows cancel the outbound call
   * @param {string} param0 an object with parameter callingId: string. Callee to be displayed
   * @returns component
   */
  const OutboundCall = ({ callingId = '' }) => {
    return (
      <div className={'outboundCallPopUp'}>
        <b>Calling {callingId}</b>
        <button
          onClick={() => {
            cancelCallNotification(outboundCall as OutboundCall);
            setOutboundCall(null);
            props.setPlayRingback(false);
          }}
        >
          Hang Up
        </button>
      </div>
    );
  };

  return (
    <div>
      <IncomingPopUp caller={callerId} />
      {!displayVideo ? (
        !outboundCall ? (
          <CallDisplay callingId={callingId} />
        ) : (
          <OutboundCall callingId={callingId} />
        )
      ) : (
        <VideoCall
          call={call as Call}
          callingUser={!callerId ? callingId : callerId}
          setDisplayVideo={setDisplayVideo}
          setCall={setCall}
          setPlayRingback={props.setPlayRingback}
        />
      )}
    </div>
  );
};
