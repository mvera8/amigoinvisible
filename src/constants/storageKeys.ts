// src/constants/storageKeys.ts
export const STORAGE_KEYS = {
  SITE_NAME: 'Amistiky',
  LOCALSTORAGE_USER: 'mv_amigoinvisible_user',
	LOCALSTORAGE_CREATED: 'mv_amigoinvisible_created',
	LOCALSTORAGE_GRUPO: 'mv_amigoinvisible_grupo',
	LOCALSTORAGE_GUEST: 'mv_amigoinvisible_guests',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
