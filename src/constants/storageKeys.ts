// src/constants/storageKeys.ts
export const STORAGE_KEYS = {
  SITE_NAME: 'Amistiky',
  LOCALSTORAGE_USER: 'mv_amigoinvisible_user',
	LOCALSTORAGE_GRUPO: 'mv_amigoinvisible_grupo',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
