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
  client.onIncoming = newCall;
  client.onIncomingState = incomingState;

  useEffect(() => {
    // make sure no more that one listener for silent_notification
    socket.removeListener('silent_notification');

    socket.on('silent_notification', async (data) => {
      console.log('silent notification data', data);
      if (call) {
        if (data.webrtc_ready) {
          console.log('only one call allowed');
        } else if (
          (data.call_cancelled || data.call_rejected) &&
          !displayVideo
        ) {
          stopCall(call, false);
        }
      } else if (data.call_rejected && !displayVideo) {
        setOutboundCall(null);
        props.setPlayRingback(false);
      } else {
        // Android requires slight delay to prevent connection issues
        // when connection is being establish
        setTimeout(() => {
          placeCall('client', data.callee);
        }, 200);
      }
    });

    console.log(
      'socket.on silent_notification listeners',
      socket.listeners('silent_notification').length
    );
  }, [call, displayVideo]);

  useEffect(() => {
    if (!displayVideo && outboundCall) {
      props.setPlayRingback(true);
    }
  }, [displayVideo, outboundCall]);

  function incomingState(state: undefined) {
    console.log('incomingState', state);
  }

  function answerCall(call: Call) {
    console.log('accepting inbound');
    call.answer(callOptions);
    setDisplayIncomingUi(false);
    setDisplayVideo(true);
    props.setPlayRing(false);
  }

  function stopCall(call: Call, rejected: boolean) {
    if (rejected) {
      call.reject(486);
      console.log('rejected the call');
    } else {
      call.disconnect();
      console.log('call disconnected');
    }
    setDisplayIncomingUi(false);
    props.setPlayRing(false);
    props.setPlayRingback(false);
    setCallerId('');
    setCall(undefined);
    setOutboundCall(null);
  }

  function newCall(obj: InboundCallObj) {
    setCallerId(obj.from);
    setDisplayIncomingUi(true);
    props.setPlayRing(true);

    // Send ringing notification to the caller
    obj.call.onDisconnect = callDisconnected;
    obj.call.ringing();
    setCall(obj.call);
  }

  function sendCallNotification(callee: string) {
    const uuid = generateUUID();
    const data = {
      uuid: uuid,
      caller: (user as User).username,
      callee: callee,
    };
    socket.emit('call_notification', data, (response: string) => {
      if (response === 'success') {
        setOutboundCall(data as OutboundCall);
      } else if (response === 'calling_web_interface') {
        placeCall('client', data.callee);
      } else {
        alert(response);
      }
    });
  }

  function cancelCallNotification(outboundCall: OutboundCall) {
    const data = outboundCall;
    data.call_cancelled = true;
    socket.emit('call_canceled', data, (response: string) => {
      console.log('call_canceled response', response);
    });
  }

  function placeCall(type: 'client' | 'service', callee: string) {
    let newOutboundCall;
    console.log('placeCall');
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

  function callDisconnected(obj: any) {
    console.log('callDisconnected', obj);
    if (obj.cause !== 'NORMAL') {
      alert(`Call disconnected - reason: ${obj.cause}`);
    }
    stopCall(obj.call, false);
  }

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
              console.log('incoming call accepted');
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
