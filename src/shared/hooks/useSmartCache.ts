import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface SmartCacheOptions {
  ttl?: number; // Time to live em milliseconds
  maxSize?: number; // Máximo de entradas no cache
  persistToStorage?: boolean; // Persistir no localStorage
  storageKey?: string;
}

export function useSmartCache<T>(options: SmartCacheOptions = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    maxSize = 100,
    persistToStorage = false,
    storageKey = 'smart-cache'
  } = options;

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedCache = JSON.parse(stored);
          const now = Date.now();
          
          // Filtrar entradas expiradas
          Object.entries(parsedCache).forEach(([key, entry]: [string, any]) => {
            if (entry.expiresAt > now) {
              cacheRef.current.set(key, entry);
            }
          });
          
          setCacheSize(cacheRef.current.size);
        }
      } catch (error) {
        console.warn('Erro ao carregar cache do localStorage:', error);
      }
    }
  }, [persistToStorage, storageKey]);

  // Salvar cache no localStorage quando necessário
  const persistCache = useCallback(() => {
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const cacheObject = Object.fromEntries(cacheRef.current);
        localStorage.setItem(storageKey, JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Erro ao salvar cache no localStorage:', error);
      }
    }
  }, [persistToStorage, storageKey]);

  // Limpar entradas expiradas
  const cleanExpiredEntries = useCallback(() => {
    const now = Date.now();
    let cleaned = false;
    
    for (const [key, entry] of cacheRef.current.entries()) {
      if (entry.expiresAt <= now) {
        cacheRef.current.delete(key);
        cleaned = true;
      }
    }
    
    if (cleaned) {
      setCacheSize(cacheRef.current.size);
      persistCache();
    }
  }, [persistCache]);

  // Limpar cache quando exceder tamanho máximo (LRU)
  const enforceMaxSize = useCallback(() => {
    if (cacheRef.current.size > maxSize) {
      // Ordenar por timestamp (mais antigo primeiro)
      const entries = Array.from(cacheRef.current.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      // Remover entradas mais antigas
      const toRemove = entries.slice(0, cacheRef.current.size - maxSize);
      toRemove.forEach(([key]) => {
        cacheRef.current.delete(key);
      });
      
      setCacheSize(cacheRef.current.size);
      persistCache();
    }
  }, [maxSize, persistCache]);

  // Definir valor no cache
  const set = useCallback((key: string, data: T) => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };
    
    cacheRef.current.set(key, entry);
    setCacheSize(cacheRef.current.size);
    
    // Limpar entradas expiradas e enforçar tamanho máximo
    cleanExpiredEntries();
    enforceMaxSize();
    
    persistCache();
  }, [ttl, cleanExpiredEntries, enforceMaxSize, persistCache]);

  // Obter valor do cache
  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    if (entry.expiresAt <= Date.now()) {
      cacheRef.current.delete(key);
      setCacheSize(cacheRef.current.size);
      persistCache();
      return null;
    }
    
    return entry.data;
  }, [persistCache]);

  // Verificar se existe no cache
  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  // Remover do cache
  const remove = useCallback((key: string): boolean => {
    const deleted = cacheRef.current.delete(key);
    if (deleted) {
      setCacheSize(cacheRef.current.size);
      persistCache();
    }
    return deleted;
  }, [persistCache]);

  // Limpar todo o cache
  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheSize(0);
    
    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [persistToStorage, storageKey]);

  // Obter estatísticas do cache
  const getStats = useCallback(() => {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const entry of cacheRef.current.values()) {
      if (entry.expiresAt <= now) {
        expiredCount++;
      }
    }
    
    return {
      size: cacheRef.current.size,
      maxSize,
      expiredCount,
      hitRate: 0, // Seria necessário rastrear hits/misses para calcular
    };
  }, [maxSize]);

  // Limpar automaticamente entradas expiradas periodicamente
  useEffect(() => {
    const interval = setInterval(cleanExpiredEntries, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, [cleanExpiredEntries]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    size: cacheSize,
    getStats,
  };
}