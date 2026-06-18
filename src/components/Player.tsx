import "@videojs/react/video/skin.css";
import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin, Video } from "@videojs/react/video";

const Player = createPlayer({ features: videoFeatures });

interface MediaPlayerProps {
  src: string;
  poster?: string;
}

export const MediaPlayer = ({ src, poster }: MediaPlayerProps) => {
  return (
    <Player.Provider>
      <VideoSkin poster={poster}>
        <Video src={src} playsInline  />
      </VideoSkin>
    </Player.Provider>
  );
};
