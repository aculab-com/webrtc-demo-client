import { Socket } from 'socket.io-client';

export type IncomingCall = {
  caller: string;
};

export type User = {
  username: string;
  webrtcToken: string;
  webrtcAccessKey: string;
  cloudRegionId: string;
  logLevel: string | number;
};

export type Client = {
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

export type Call = {
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
  onConnected: (obj: any) => void;
  onConnecting: (obj: any) => void;
  onDisconnect: (obj: any) => void;
  onRinging: (obj: any) => void;
  onMedia: (obj: any) => void;
  onLocalVideoMute: () => void;
  onLocalVideoUnmute: () => void;
  onRemoteVideoMute: () => void;
  onRemoteVideoUnmute: () => void;
};

export type InboundCallObj = {
  call: Call;
  from: string;
  type: 'client' | 'service';
  offeringAudio: boolean;
  offeringVideo: boolean;
  canReceiveAudio: boolean;
  canReceiveVideo: boolean;
};

export type WebRtcStatus =
  | 'idle'
  | 'gotMedia'
  | 'connecting'
  | 'connected'
  | 'calling'
  | 'ringing';

export type CallCompProps = {
  socket: Socket;
  client: any;
  user: User | undefined;
};

export type RegisterProps = {
  socket: Socket;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
};

export type RegResponse =
  | { status: 'userCreated'; data: User }
  | { status: 'error'; data: { message: string } };

export interface unRegResponse {
  status: 'error' | 'deleted';
  data: { message: string };
}

export interface OutboundCall {
  uuid: string;
  caller: string;
  callee: string;
  call_cancelled?: boolean;
}
