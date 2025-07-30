import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const JitsiMeet = ({ roomName, user, onApiReady, onParticipantJoined, onParticipantLeft }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (roomName && jitsiContainerRef.current) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.name || 'Mentor',
          email: user?.email || '',
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableModeratorIndicator: true,
          enableClosePage: false,
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'mute-everyone', 'security'
          ],
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'mute-everyone', 'security'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_BANNER: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK: false,
        },
      };

      // Load Jitsi Meet API script
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        if (window.JitsiMeetExternalAPI) {
          const api = new window.JitsiMeetExternalAPI(domain, options);
          apiRef.current = api;

          api.addEventListeners({
            readyToClose: () => {
              console.log('Jitsi Meet ready to close');
            },
            participantJoined: (id, participant) => {
              console.log('Participant joined:', participant);
              if (onParticipantJoined) onParticipantJoined(participant);
            },
            participantLeft: (id, participant) => {
              console.log('Participant left:', participant);
              if (onParticipantLeft) onParticipantLeft(participant);
            },
            videoConferenceJoined: () => {
              console.log('Joined video conference');
            },
            videoConferenceLeft: () => {
              console.log('Left video conference');
            },
          });

          if (onApiReady) onApiReady(api);
        }
      };
      document.head.appendChild(script);

      return () => {
        if (apiRef.current) {
          apiRef.current.dispose();
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [roomName, user, onApiReady, onParticipantJoined, onParticipantLeft]);

  return (
    <Box
      ref={jitsiContainerRef}
      sx={{
        width: '100%',
        height: '400px',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    />
  );
};

export default JitsiMeet; 