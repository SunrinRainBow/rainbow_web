import { useState, useEffect, useRef, useCallback } from 'react';
import * as deepar from 'deepar';

const EFFECTS_BASE_PATH = '/effects/';
const DEEPAR_EFFECTS_CDN = 'https://cdn.jsdelivr.net/npm/deepar/effects/';

export const DEEPAR_EFFECTS = {
  style: [
    { id: 'aviators', name: 'Aviators', path: `${DEEPAR_EFFECTS_CDN}aviators`, preview: '🕶️' },
    { id: 'koala', name: 'Koala', path: `${DEEPAR_EFFECTS_CDN}koala`, preview: '🐨' },
    { id: 'lion', name: 'Lion', path: `${DEEPAR_EFFECTS_CDN}lion`, preview: '🦁' },
    { id: 'dalmatian', name: 'Dalmatian', path: `${DEEPAR_EFFECTS_CDN}dalmatian`, preview: '🐕' },
    { id: 'viking_helmet', name: 'Viking Helmet', path: `${EFFECTS_BASE_PATH}viking_helmet.deepar`, preview: '⚔️' },
    { id: 'vendetta_mask', name: 'Vendetta Mask', path: `${EFFECTS_BASE_PATH}Vendetta_Mask.deepar`, preview: '🎭' },
    { id: 'flower_face', name: 'Flower Face', path: `${EFFECTS_BASE_PATH}flower_face.deepar`, preview: '🌸' },
    { id: 'humanoid', name: 'Humanoid', path: `${EFFECTS_BASE_PATH}Humanoid.deepar`, preview: '🤖' },
    { id: 'snail', name: 'Snail', path: `${EFFECTS_BASE_PATH}Snail.deepar`, preview: '🐌' },
    { id: 'neon_devil_horns', name: 'Devil Horns', path: `${EFFECTS_BASE_PATH}Neon_Devil_Horns.deepar`, preview: '😈' },
    { id: 'fire_effect', name: 'Fire Effect', path: `${EFFECTS_BASE_PATH}Fire_Effect.deepar`, preview: '🔥' },
    { id: 'hope', name: 'Hope', path: `${EFFECTS_BASE_PATH}Hope.deepar`, preview: '✨' },
    { id: 'burning_effect', name: 'Burning Man', path: `${EFFECTS_BASE_PATH}burning_effect.deepar`, preview: '🔥' },
    { id: 'galaxy_background', name: 'Galaxy Background', path: `${EFFECTS_BASE_PATH}galaxy_background.deepar`, preview: '🌌' },
    { id: 'elephant_trunk', name: 'Elephant Trunk', path: `${EFFECTS_BASE_PATH}Elephant_Trunk.deepar`, preview: '🐘' },
    { id: 'emotion_meter', name: 'Emotion Meter', path: `${EFFECTS_BASE_PATH}Emotion_Meter.deepar`, preview: '😊' },
    { id: 'emotions_exaggerator', name: 'Emotions Exaggerator', path: `${EFFECTS_BASE_PATH}Emotions_Exaggerator.deepar`, preview: '😄' },
    { id: 'ping_pong', name: 'Ping Pong', path: `${EFFECTS_BASE_PATH}Ping_Pong.deepar`, preview: '🏓' },
    { id: 'pixel_hearts', name: 'Pixel Hearts', path: `${EFFECTS_BASE_PATH}8bitHearts.deepar`, preview: '💕' },
    { id: 'stallone', name: 'Stallone', path: `${EFFECTS_BASE_PATH}Stallone.deepar`, preview: '💪' },
    { id: 'split_view', name: 'Split View', path: `${EFFECTS_BASE_PATH}Split_View_Look.deepar`, preview: '↔️' },
  ],
  beauty: [
    { id: 'makeup_look', name: 'Makeup Look', path: `${EFFECTS_BASE_PATH}MakeupLook.deepar`, preview: '💄' },
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
      const deepARInstance = await deepar.initialize({
        licenseKey,
        previewElement,
        additionalOptions: {
          cameraConfig: {
            facingMode: 'user',
          },
        },
      });

      deepARRef.current = deepARInstance;
      setIsInitialized(true);
      setCurrentEffect(null);
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

      const allEffects = [...DEEPAR_EFFECTS.style, ...DEEPAR_EFFECTS.beauty];
      const matchedEffect = allEffects.find(e => e.path === effectPath);
      setCurrentEffect(matchedEffect?.id || effectPath);
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

