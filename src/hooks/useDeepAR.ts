import { useState, useEffect, useRef, useCallback } from 'react';
import * as deepar from 'deepar';

// DeepAR CDN 기본 URL (공식 문서 참조: https://docs.deepar.ai/deepar-sdk/platforms/web/getting-started)
const DEEPAR_EFFECTS_CDN = 'https://cdn.jsdelivr.net/npm/deepar/effects/';

export const DEEPAR_EFFECTS = {

  style: [
    { id: 'aviators', name: 'Aviators', path: `${DEEPAR_EFFECTS_CDN}aviators`, preview: '🕶️' },
    { id: 'beard', name: 'Beard', path: `${DEEPAR_EFFECTS_CDN}beard`, preview: '🧔' },
    { id: 'dalmatian', name: 'Dalmatian', path: `${DEEPAR_EFFECTS_CDN}dalmatian`, preview: '🐕' },
    { id: 'flowers', name: 'Flowers', path: `${DEEPAR_EFFECTS_CDN}flowers`, preview: '🌸' },
    { id: 'koala', name: 'Koala', path: `${DEEPAR_EFFECTS_CDN}koala`, preview: '🐨' },
    { id: 'lion', name: 'Lion', path: `${DEEPAR_EFFECTS_CDN}lion`, preview: '🦁' },
    { id: 'teddycigar', name: 'Teddy Cigar', path: `${DEEPAR_EFFECTS_CDN}teddycigar`, preview: '🧸' },
    { id: 'background_segmentation', name: 'Background Blur', path: `${DEEPAR_EFFECTS_CDN}background_segmentation`, preview: '🌫️' },
    { id: 'tripleface', name: 'Triple Face', path: `${DEEPAR_EFFECTS_CDN}tripleface`, preview: '👥' },
    { id: 'sleepingmask', name: 'Sleeping Mask', path: `${DEEPAR_EFFECTS_CDN}sleepingmask`, preview: '😴' },
    { id: 'fatify', name: 'Fatify', path: `${DEEPAR_EFFECTS_CDN}fatify`, preview: '🫃' },
    { id: 'smallface', name: 'Small Face', path: `${DEEPAR_EFFECTS_CDN}smallface`, preview: '🤏' },
    { id: 'Split_View_Look', name: 'Split View', path: `${DEEPAR_EFFECTS_CDN}Split_View_Look`, preview: '↔️' },
    { id: 'Emotion_Meter', name: 'Emotion Meter', path: `${DEEPAR_EFFECTS_CDN}Emotion_Meter`, preview: '😊' },
    { id: 'Ping_Pong', name: 'Ping Pong', path: `${DEEPAR_EFFECTS_CDN}Ping_Pong`, preview: '🏓' },
  ],

  beauty: [
    { id: 'beauty_0', name: 'Natural', path: `${DEEPAR_EFFECTS_CDN}beauty`, preview: '✨' },
    { id: 'makeup1', name: 'Makeup 1', path: `${DEEPAR_EFFECTS_CDN}Makeup_Look`, preview: '💄' },
    { id: 'blush', name: 'Blush', path: `${DEEPAR_EFFECTS_CDN}blush`, preview: '🌸' },
  ],
};

interface UseDeepARReturn {
  isInitialized: boolean;
  isLoading: boolean;
  currentEffect: string | null;
  error: string | null;
  initialize: (previewElement: HTMLElement) => Promise<void>;
  switchEffect: (effectPath: string) => Promise<void>;
  clearEffect: () => Promise<void>;
  takeScreenshot: () => Promise<string | null>;
  backgroundBlur: (enable: boolean, strength?: number) => Promise<void>;
  destroy: () => void;
}

export function useDeepAR(): UseDeepARReturn {

  const licenseKey = import.meta.env.VITE_DEEPAR_LICENSE_KEY || '';

  const deepARRef = useRef<deepar.DeepAR | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async (previewElement: HTMLElement) => {
    if (deepARRef.current) return;
    
    if (!licenseKey) {
      setError('DeepAR 라이센스 키가 필요합니다. VITE_DEEPAR_LICENSE_KEY 환경변수를 설정해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 공식 문서: https://docs.deepar.ai/deepar-sdk/platforms/web/getting-started
      const deepARInstance = await deepar.initialize({
        licenseKey,
        previewElement,
        effect: `${DEEPAR_EFFECTS_CDN}aviators`,
        additionalOptions: {
          cameraConfig: {
            facingMode: 'user',
          },
        },
      });

      deepARRef.current = deepARInstance;
      setIsInitialized(true);
      setCurrentEffect('aviators');
    } catch (err) {
      console.error('DeepAR 초기화 실패:', err);
      setError('DeepAR 초기화에 실패했습니다. 라이센스 키를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [licenseKey]);

  const switchEffect = useCallback(async (effectPath: string) => {
    if (!deepARRef.current) {
      setError('DeepAR이 초기화되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deepARRef.current.switchEffect(effectPath);

      const effectId = effectPath.split('/').pop() || effectPath;
      setCurrentEffect(effectId);
    } catch (err) {
      console.error('효과 로드 실패:', err);
      setError('효과를 로드하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearEffect = useCallback(async () => {
    if (!deepARRef.current) return;

    try {
      await deepARRef.current.clearEffect();
      setCurrentEffect(null);
    } catch (err) {
      console.error('효과 제거 실패:', err);
    }
  }, []);

  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    if (!deepARRef.current) return null;

    try {
      const image = await deepARRef.current.takeScreenshot();
      return image;
    } catch (err) {
      console.error('스크린샷 촬영 실패:', err);
      return null;
    }
  }, []);

  const backgroundBlur = useCallback(async (enable: boolean, strength: number = 5) => {
    if (!deepARRef.current) return;

    try {
      await deepARRef.current.backgroundBlur(enable, strength);
    } catch (err) {
      console.error('배경 블러 설정 실패:', err);
    }
  }, []);

  const destroy = useCallback(() => {
    if (deepARRef.current) {
      deepARRef.current.shutdown();
      deepARRef.current = null;
      setIsInitialized(false);
      setCurrentEffect(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  return {
    isInitialized,
    isLoading,
    currentEffect,
    error,
    initialize,
    switchEffect,
    clearEffect,
    takeScreenshot,
    backgroundBlur,
    destroy,
  };
}

