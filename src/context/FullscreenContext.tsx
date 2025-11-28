import { createContext, useContext, RefObject } from 'react';

interface FullscreenContextType {
  containerRef: RefObject<HTMLDivElement> | null;
  isFullscreen: boolean;
}

export const FullscreenContext = createContext<FullscreenContextType>({
  containerRef: null,
  isFullscreen: false,
});

export const useFullscreenContainer = () => {
  return useContext(FullscreenContext);
};
