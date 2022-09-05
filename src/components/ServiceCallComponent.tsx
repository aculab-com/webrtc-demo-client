import { useState } from 'react';
import { Call, OutboundCallProps } from '../types';

/**
 * Service call component
 * @param {OutboundCallProps} props outbound call properties
 * @returns component
 */
export const ServiceCall = (props: OutboundCallProps) => {
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

  /**
   * sets serviceCall state in parent component
   * @param {boolean} isService true if service call else false
   */
  function isServiceCall(isService: boolean) {
    if (props.setServiceCall) {
      props.setServiceCall(isService);
    }
  }

  /**
   * Set call states to default values
   */
  function setDefault() {
    isServiceCall(false);
    props.setCall(undefined);
    props.setDisplayVideo(false);
  }

  /**
   * Use for call.onMedia\
   * loads and plays remote audio
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

  /**
   * Use for call.onConnected\
   * Stop ringback + enable component buttons
   * @param obj onConnected object
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  function onConnected(obj: any) {
    playRingback(false);
    setButtonsDisabled(false);
  }

  /**
   * Use for call.onDisconnect\
   * Calls disconnectHandler\
   * If cause of disconnecting differs from NORMAL an alert message with cause is displayed
   * @param obj onDisconnect object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDisconnect(obj: any) {
    // playRingback(false);
    if (obj.cause !== 'NORMAL') {
      alert(`Call disconnected - reason: ${obj.cause}`);
    }
    disconnectHandler(props.call);
  }

  /**
   * Handles WebRTC call disconnecting\
   * Resets call, displayVideo and webRtcStatus states
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
