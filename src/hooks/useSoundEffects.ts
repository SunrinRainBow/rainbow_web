import { useCallback, useRef } from 'react';

// 무료 효과음 URL (freesound.org에서 가져온 짧은 효과음들)
const SOUNDS = {
  // 매칭 성공 - 밝은 알림음
  matchSuccess: 'https://cdn.pixabay.com/audio/2022/03/24/audio_6df0a7a54a.mp3',
  // 통화 시작 - 연결음
  callStart: 'https://cdn.pixabay.com/audio/2022/10/30/audio_3c6a032a20.mp3',
  // 통화 종료 - 끊는 소리
  callEnd: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
};

export function useSoundEffects() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((soundType: keyof typeof SOUNDS) => {
    try {
      // 이전 오디오 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(SOUNDS[soundType]);
      audio.volume = 0.5;
      audioRef.current = audio;
      
      audio.play().catch((err) => {
        console.log('Sound play failed:', err);
      });
    } catch (err) {
      console.log('Sound error:', err);
    }
  }, []);

  const playMatchSuccess = useCallback(() => {
    playSound('matchSuccess');
  }, [playSound]);

  const playCallStart = useCallback(() => {
    playSound('callStart');
  }, [playSound]);

  const playCallEnd = useCallback(() => {
    playSound('callEnd');
  }, [playSound]);

  return {
    playMatchSuccess,
    playCallStart,
    playCallEnd,
  };
}

