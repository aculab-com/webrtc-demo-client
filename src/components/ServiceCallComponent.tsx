import { useState } from 'react';
import { Call, OutboundCallProps } from '../types';

export const ServiceCall = (props: OutboundCallProps) => {
  // export const ServiceCall = () => {
  const [buttonsDisabled, setButtonsDisabled] = useState(true);

  props.call.onMedia = gotMedia;
  props.call.onConnected = onConnected;
  props.call.onDisconnect = onDisconnect;

  /**
   * Helper function to start and stop ringback
   * @param {boolean} ring play ringback true/false
   */
  function playRingback(ring: boolean) {
    props.setPlayRingback(ring);
  }

  function isServiceCall(isService: boolean) {
    if (props.setServiceCall) {
      props.setServiceCall(isService);
    }
  }

  function setDefault() {
    isServiceCall(false);
    props.setCall(undefined);
    props.setDisplayVideo(false);
  }

  /**
   * Use for call.onMedia\
   * It changes webrtcStatus to gotMedia
   * loads and plays remote video/audio
   * @param obj onMedia object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gotMedia(obj: any) {
    console.log('gotMedia', obj);
    const player = document.getElementById('servicePlayer') as HTMLVideoElement;
    if (player) {
      player.srcObject = obj.stream;
      player.load();
      player.play().catch((error) => {
        console.error(error);
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  function onConnected(obj: any) {
    playRingback(false);
    setButtonsDisabled(false);
  }

  /**
   * Use for call.onDisconnect\
   * Stops ringback and calls disconnectHandler\
   * If cause of disconnecting differs from NORMAL an alert message with cause is displayed
   * @param obj onDisconnect object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDisconnect(obj: any) {
    playRingback(false);
    if (obj.cause !== 'NORMAL') {
      alert(`Call disconnected - reason: ${obj.cause}`);
    }
    disconnectHandler(props.call);
  }

  /**
   * handles WebRTC call disconnecting\
   * resets call, displayVideo and webRtcStatus states
   * @param {Call} call call to be disconnected
   */
  function disconnectHandler(call?: Call) {
    if (call) {
      call.disconnect();
    }
    setDefault();
  }

  return (
    <div className="serviceCallWrap">
      <audio id="servicePlayer" />
      <div className="statsWrap">
        <div className="displayStat">
          <b>Calling service: {props.callingUser}</b>
        </div>
      </div>
      <div className="dialKeysWrap">
        <div>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('1')}
          >
            1
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('2')}
          >
            2
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('3')}
          >
            3
          </button>
        </div>
        <div>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('4')}
          >
            4
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('5')}
          >
            5
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('6')}
          >
            6
          </button>
        </div>
        <div>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('7')}
          >
            7
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('8')}
          >
            8
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('9')}
          >
            9
          </button>
        </div>
        <div>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('*')}
          >
            *
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('0')}
          >
            0
          </button>
          <button
            disabled={buttonsDisabled}
            onClick={() => props.call.sendDtmf('#')}
          >
            #
          </button>
        </div>
      </div>
      <div className="videoButtonsWrap">
        <button
          className="videoButton"
          style={{ backgroundColor: 'red' }}
          disabled={buttonsDisabled}
          onClick={() => {
            disconnectHandler(props.call);
          }}
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};
