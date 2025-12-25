/**
 * VideoCall Component - WebRTC Video Calling
 * Handles peer-to-peer video calls between users
 * Simplified for cross-device compatibility
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiX, FiMaximize2, FiMinimize2, FiRefreshCw } from 'react-icons/fi';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  avatar: string | null;
}

interface VideoCallProps {
  socket: Socket | null;
  currentUser: User;
  remoteUser: User;
  conversationId: string;
  isIncoming?: boolean;
  onClose: () => void;
}

// ICE servers for WebRTC - using multiple STUN servers for reliability
const iceServers: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCall({
  socket,
  currentUser: _currentUser,
  remoteUser,
  conversationId,
  isIncoming = false,
  onClose,
}: VideoCallProps) {
  void _currentUser;
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState<'user' | 'environment'>('user');
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get local media - simplified constraints for compatibility
  const getLocalStream = useCallback(async (facingMode: 'user' | 'environment' = 'user') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Failed to get media:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      return null;
    }
  }, []);

  // End call - defined early for use in other functions
  const endCall = useCallback(() => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    socket?.emit('call:end', { targetUserId: remoteUser.id });
    setCallStatus('ended');
    setTimeout(onClose, 1000);
  }, [socket, remoteUser.id, onClose]);

  // Setup peer connection with all handlers
  const setupPeerConnection = useCallback((stream: MediaStream) => {
    // Close existing connection if any
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    // Add local tracks to connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('call:ice-candidate', {
          targetUserId: remoteUser.id,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle remote stream - THIS IS KEY FOR SEEING REMOTE VIDEO
    pc.ontrack = (event) => {
      console.log('📹 Got remote track:', event.track.kind);

      // Create or get remote stream
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      // Add track to remote stream
      remoteStreamRef.current.addTrack(event.track);

      // Attach to video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        setHasRemoteStream(true);
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        if (!callTimerRef.current) {
          callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
      } else if (pc.connectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  }, [socket, remoteUser.id, endCall]);

  // Start outgoing call - caller creates offer
  const startCall = useCallback(async () => {
    setCallStatus('connecting');

    const stream = await getLocalStream();
    if (!stream) return;

    const pc = setupPeerConnection(stream);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit('call:offer', {
        targetUserId: remoteUser.id,
        offer: pc.localDescription,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [getLocalStream, setupPeerConnection, socket, remoteUser.id]);

  // Accept incoming call - receiver creates answer
  const acceptCall = useCallback(async () => {
    setCallStatus('connecting');

    const stream = await getLocalStream();
    if (!stream) return;

    // Tell caller we accepted
    socket?.emit('call:accept', {
      callerId: remoteUser.id,
      conversationId,
    });
  }, [getLocalStream, socket, remoteUser.id, conversationId]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    if (!localStreamRef.current || !peerConnectionRef.current) return;

    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    try {
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) oldVideoTrack.stop();

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      localStreamRef.current.removeTrack(oldVideoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newVideoTrack);

      setCurrentFacingMode(newFacingMode);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  // Handle all socket events for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    // Received offer from caller - create answer
    const handleOffer = async (data: { callerId: string; offer: RTCSessionDescriptionInit }) => {
      if (data.callerId !== remoteUser.id) return;
      console.log('📥 Received offer');

      // Make sure we have local stream
      if (!localStreamRef.current) {
        console.log('⏳ Waiting for local stream...');
        // Store offer to process after acceptCall gets stream
        pendingCandidatesRef.current = []; // Clear any old candidates

        // Wait a bit for stream
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!localStreamRef.current) {
          console.log('❌ Still no local stream');
          return;
        }
      }

      try {
        const pc = setupPeerConnection(localStreamRef.current);

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

        // Process any pending ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
        pendingCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('call:answer', {
          targetUserId: remoteUser.id,
          answer: pc.localDescription
        });
        console.log('✅ Answer sent');
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Received answer from receiver
    const handleAnswer = async (data: { answererId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.answererId !== remoteUser.id) return;
      console.log('📥 Received answer');

      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

        // Process any pending ICE candidates
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
        pendingCandidatesRef.current = [];
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    };

    // Received ICE candidate
    const handleIceCandidate = async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      if (data.fromUserId !== remoteUser.id) return;

      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      } else {
        // Queue for later
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    const handleCallEnded = () => endCall();
    const handleCallRejected = () => {
      setCallStatus('ended');
      setTimeout(onClose, 1000);
    };

    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:rejected', handleCallRejected);

    return () => {
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:rejected', handleCallRejected);
    };
  }, [socket, remoteUser.id, setupPeerConnection, endCall, onClose]);

  // Start call on mount (for outgoing calls)
  useEffect(() => {
    if (!isIncoming && socket) {
      socket.emit('call:initiate', { targetUserId: remoteUser.id, conversationId });
      startCall();
    }
  }, [isIncoming, socket, remoteUser.id, conversationId, startCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-slate-900 z-50 flex flex-col ${isFullscreen ? '' : 'safe-area-inset'}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {remoteUser.avatar ? <img src={remoteUser.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : remoteUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm sm:text-base">{remoteUser.name}</p>
            <p className="text-white/70 text-xs sm:text-sm">
              {callStatus === 'ringing' && (isIncoming ? 'Incoming call...' : 'Calling...')}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && formatDuration(callDuration)}
              {callStatus === 'ended' && 'Call ended'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 sm:p-3 text-white hover:bg-white/20 active:bg-white/30 rounded-lg touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden bg-slate-900">
        {/* Remote Video - Full screen */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-slate-900"
        />

        {/* Placeholder when no remote stream */}
        {!hasRemoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl mb-4">
              {remoteUser.avatar ? (
                <img src={remoteUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                remoteUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <p className="text-white/70 text-sm sm:text-base">
              {callStatus === 'connecting' ? 'Connecting...' : 'Waiting for video...'}
            </p>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-20 sm:bottom-24 right-3 sm:right-4 w-24 h-32 sm:w-32 sm:h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30 bg-slate-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <FiVideoOff className="text-white/50" size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Controls - Mobile optimized with larger touch targets */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-safe flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-t from-black/70 to-transparent">
        {callStatus === 'ringing' && isIncoming ? (
          <>
            <button
              onClick={() => { socket?.emit('call:reject', { callerId: remoteUser.id }); onClose(); }}
              className="p-4 sm:p-5 bg-red-500 rounded-full text-white hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center"
              aria-label="Reject call"
            >
              <FiPhoneOff size={24} className="sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={acceptCall}
              className="p-4 sm:p-5 bg-green-500 rounded-full text-white hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center"
              aria-label="Accept call"
            >
              <FiPhone size={24} className="sm:w-7 sm:h-7" />
            </button>
          </>
        ) : callStatus === 'ringing' ? (
          <>
            <button
              onClick={startCall}
              className="p-4 sm:p-5 bg-green-500 rounded-full text-white hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center"
              aria-label="Start call"
            >
              <FiPhone size={24} className="sm:w-7 sm:h-7" />
            </button>
            <button
              onClick={onClose}
              className="p-4 sm:p-5 bg-red-500 rounded-full text-white hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center"
              aria-label="Cancel call"
            >
              <FiX size={24} className="sm:w-7 sm:h-7" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`p-3 sm:p-4 rounded-full transition-colors shadow-lg touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiMicOff size={20} className="sm:w-6 sm:h-6" /> : <FiMic size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 sm:p-4 rounded-full transition-colors shadow-lg touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 active:bg-white/40'}`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <FiVideoOff size={20} className="sm:w-6 sm:h-6" /> : <FiVideo size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={switchCamera}
              className="p-3 sm:p-4 rounded-full bg-white/20 text-white hover:bg-white/30 active:bg-white/40 transition-colors shadow-lg touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] flex items-center justify-center"
              title="Switch camera"
              aria-label="Switch camera"
            >
              <FiRefreshCw size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={endCall}
              className="p-4 sm:p-5 bg-red-500 rounded-full text-white hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] flex items-center justify-center"
              title="End call"
              aria-label="End call"
            >
              <FiPhoneOff size={24} className="sm:w-7 sm:h-7" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

