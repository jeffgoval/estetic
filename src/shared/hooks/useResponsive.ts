import { useState, useEffect } from 'react';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    current: BreakpointKey;
  }>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      width,
      height,
      current: getCurrentBreakpoint(width, breakpoints),
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        current: getCurrentBreakpoint(width, breakpoints),
      });
    };

    // Usar ResizeObserver se disponível para melhor performance
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      
      resizeObserver.observe(document.documentElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback para addEventListener
      window.addEventListener('resize', handleResize, { passive: true });
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [breakpoints]);

  // Funções utilitárias
  const isMobile = screenSize.current === 'xs' || screenSize.current === 'sm';
  const isTablet = screenSize.current === 'md';
  const isDesktop = screenSize.current === 'lg' || screenSize.current === 'xl' || screenSize.current === '2xl';
  
  const isAtLeast = (breakpoint: BreakpointKey) => {
    return screenSize.width >= breakpoints[breakpoint];
  };
  
  const isAtMost = (breakpoint: BreakpointKey) => {
    return screenSize.width <= breakpoints[breakpoint];
  };

  return {
    ...screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isAtLeast,
    isAtMost,
    breakpoints,
  };
}

function getCurrentBreakpoint(width: number, breakpoints: Breakpoints): BreakpointKey {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}