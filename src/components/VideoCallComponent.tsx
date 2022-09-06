import { useEffect, useState } from 'react';
import video_placeholder from '../media/video_placeholder.png';
import { Call, OutboundCallProps, WebRtcStatus } from '../types';

/**
 * Component to display client to client call and supports video
 * @param {OutboundCallProps} props takes object with properties call, callingUser, setDisplayVideo, setCall
 * @returns component
 */
export const VideoCall = (props: OutboundCallProps) => {
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
  const [webRtcStatus, setWebRtcStatus] = useState<WebRtcStatus>('idle');
  const [localStream, setLocalStream] = useState();

  // Set call callbacks
  props.call.onRinging = onRinging;
  props.call.onDisconnect = onDisconnect;
  props.call.onMedia = gotMedia;
  props.call.onConnecting = onConnecting;
  props.call.onConnected = onConnected;
  props.call.onLocalVideoMute = onLocalVideoMute;
  props.call.onLocalVideoUnmute = onLocalVideoUnmute;
  props.call.onRemoteVideoMute = onRemoteVideoMute;
  props.call.onRemoteVideoUnmute = onRemoteVideoUnmute;

  // loads and plays local video/audio
  useEffect(() => {
    const localPlayer = document.getElementById(
      'localPlayer'
    ) as HTMLVideoElement;
    if (!localVideoMuted && localStream) {
      localPlayer.srcObject = localStream;
      localPlayer.load();
      localPlayer.play().catch((err) => {
        console.error(err);
      });
    } else {
      localPlayer.pause();
      localPlayer.srcObject = null;
      localPlayer.load();
    }
  }, [localVideoMuted, localStream]);

  /**
   * Use for call.onRinging\
   * It changes webrtcStatus to ringing
   * @param obj onRinging object
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  function onRinging(obj: any) {
    setWebRtcStatus('ringing');
  }

  /**
   * Use for call.onConnecting\
   * It changes webrtcStatus to connecting
   * @param obj onConnecting object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onConnecting(obj: any) {
    setWebRtcStatus('connecting');
    setLocalStream(obj.stream);
  }

  /**
   * Use for call.onMedia\
   * It changes webrtcStatus to gotMedia
   * loads and plays remote video/audio
   * @param obj onMedia object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gotMedia(obj: any) {
    setWebRtcStatus('gotMedia');
    const player = document.getElementById('player') as HTMLVideoElement;
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
   * It changes webrtcStatus to connected
   * stops ringback
   * @param obj onConnected object
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  function onConnected(obj: any) {
    props.setPlayRingback(false);
    setWebRtcStatus('connected');
  }

  /**
   * Use for call.onDisconnect\
   * Stops ringback and calls disconnectHandler\
   * If cause of disconnecting differs from NORMAL an alert message with cause is displayed
   * @param obj onDisconnect object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDisconnect(obj: any) {
    props.setPlayRingback(false);
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
    setWebRtcStatus('idle');
    props.setCall(undefined);
    props.setDisplayVideo(false);
  }

  // Mute call-back functions
  /**
   * Set state of local video mute to true
   */
  function onLocalVideoMute() {
    setLocalVideoMuted(true);
    console.log('onLocalVideoMute', localVideoMuted);
  }

  /**
   * Set state of local video mute to false
   */
  function onLocalVideoUnmute() {
    setLocalVideoMuted(false);
    console.log('onLocalVideoUnmute', localVideoMuted);
  }

  /**
   * Set state of remote video mute to true
   */
  function onRemoteVideoMute() {
    setRemoteVideoMuted(true);
    console.log('onRemoteVideoMute', remoteVideoMuted);
  }

  /**
   * Set state of remote video mute to false
   */
  function onRemoteVideoUnmute() {
    setRemoteVideoMuted(false);
    console.log('onRemoteVideoUnmute', remoteVideoMuted);
  }

  /**
   * mute audio or video on existing call
   * @param {Call} call call to be muted
   * @param {'audio' | 'video'} mute defines if to mute audio or video
   */
  function mute_call(call: Call, mute: 'audio' | 'video') {
    switch (mute) {
      case 'audio':
        call.mute(!localAudioMuted, false, localVideoMuted, false);
        setLocalAudioMuted(!localAudioMuted);
        break;
      case 'video':
        call.mute(localAudioMuted, false, !localVideoMuted, false);
        setLocalVideoMuted(!localVideoMuted);
        break;
    }
  }

  return (
    <div className="videoDisplayWindow">
      <div className="statsWrap">
        <div className="displayStat">
          <b>Calling: {props.callingUser}</b>
        </div>
        <div className="displayStat">
          <b>Call Status: {webRtcStatus}</b>
        </div>
      </div>
      <div className="videoDisplayWrapper">
        <div className="videoDisplay">
          <video id="player" poster={video_placeholder}></video>
        </div>
        <div className="videoDisplay">
          <video id="localPlayer" poster={video_placeholder}></video>
        </div>
      </div>
      <div className="videoButtonsWrap">
        <button
          className="videoButton"
          disabled={webRtcStatus !== 'connected' ? true : false}
          onClick={() => {
            mute_call(props.call, 'video');
          }}
        >
          Mute Video
        </button>
        <button
          className="videoButton"
          disabled={webRtcStatus !== 'connected' ? true : false}
          onClick={() => {
            mute_call(props.call, 'audio');
          }}
        >
          Mute Audio
        </button>
        <button
          className="videoButton"
          style={{ backgroundColor: 'red' }}
          disabled={
            webRtcStatus === 'idle' || webRtcStatus === 'connecting'
              ? true
              : false
          }
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
