import { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import ringing from '../media/ringing.wav';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import ringback from '../media/ringback.wav';
import video_placeholder from '../media/video_placeholder.png';
import { Call, WebRtcStatus } from '../types';

type VideoCallProps = {
  call: Call;
  callingUser: string;
  setDisplayVideo: React.Dispatch<React.SetStateAction<boolean>>;
  setCall: React.Dispatch<Call | undefined>;
};

export const VideoCall = (props: VideoCallProps) => {
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
  const [webRtcStatus, setWebRtcStatus] = useState<WebRtcStatus>('idle');

  props.call.onRinging = onRinging;
  props.call.onDisconnect = callDisconnected;
  props.call.onMedia = gotMedia;
  props.call.onConnecting = connecting;
  props.call.onConnected = connected;
  props.call.onLocalVideoMute = onLocalVideoMute;
  props.call.onLocalVideoUnMute = onLocalVideoUnMute;
  props.call.onRemoteVideoMute = onRemoteVideoMute;
  props.call.onRemoteVideoUnMute = onRemoteVideoUnMute;

  function onRinging(obj: any) {
    console.log('ringing', obj);
    setWebRtcStatus('ringing');
  }

  function connecting(obj: any) {
    console.log('connecting', obj);
    setWebRtcStatus('connecting');
    const localPlayer = document.getElementById(
      'localPlayer'
    ) as HTMLVideoElement;
    localPlayer.srcObject = obj.stream;
    localPlayer.load();
    localPlayer.play().catch((err) => {
      console.error(err);
    });
  }

  function gotMedia(obj: any) {
    console.log('gotMedia', obj);
    setWebRtcStatus('gotMedia');
    const player = document.getElementById('player') as HTMLVideoElement;
    if (player) {
      player.srcObject = obj.stream;
      player.load();
      player.play().catch((error) => {
        console.log(error);
      });
    }
  }

  function connected(obj: any) {
    console.log('connected', obj);
    setWebRtcStatus('connected');
  }

  function callDisconnected(obj: any) {
    console.log('callDisconnected', obj);
    if (obj.cause !== 'NORMAL') {
      alert(`Client: ${obj.cause}`);
    }
    handle_disconnect(props.call);
  }

  function handle_disconnect(call?: Call) {
    console.log('handle disconnect call', call);
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
  function onLocalVideoUnMute() {
    setLocalVideoMuted(false);
    console.log('onLocalVideoUnMute', localVideoMuted);
    // console.log('call', call);
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
  function onRemoteVideoUnMute() {
    setRemoteVideoMuted(false);
    console.log('onRemoteVideoUnMute', remoteVideoMuted);
  }

  useEffect(() => {
    // play when outbound call
    // if (displayVideo) {
    //   const player = document.getElementById('player') as HTMLAudioElement;
    //   if (player.canPlayType('audio/wav')) {
    //     player.loop = true;
    //     player.src = ringback;
    //     player.load();
    //     player.play().catch((err) => {
    //       console.log('Play ringback error:', err);
    //     });
    //   } else {
    //     // Browser can't play audio/wav
    //   }
    // }
  }, []);

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
          <b>Calling: {props.callingUser}</b>
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
            mute_call(props.call, 'video');
          }}
        >
          Mute Video
        </button>
        <button
          className="videoButton"
          onClick={() => {
            console.log('mute audio pressed');
            mute_call(props.call, 'audio');
          }}
        >
          Mute Audio
        </button>
        <button
          className="videoButton"
          style={{ backgroundColor: 'red' }}
          onClick={() => {
            console.log('incoming call rejected');
            handle_disconnect(props.call);
          }}
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};