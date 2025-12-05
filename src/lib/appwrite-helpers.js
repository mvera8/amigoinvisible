// src/lib/appwrite-helpers.js
import { ID } from "appwrite";
import { databases } from "./appwrite";

const databaseId = import.meta.env.VITE_APPWRITE_DATABSE;

/**
 * Crear un documento
 * @param {string} collectionId - ID de la colección
 * @param {object} data - Datos del documento
 * @param {string} documentId - ID del documento (opcional, genera uno único por defecto)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const create = async (collectionId, data, documentId = ID.unique()) => {
  try {
    const response = await databases.createDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error al crear documento en ${collectionId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener un documento por ID
 * @param {string} collectionId - ID de la colección
 * @param {string} documentId - ID del documento
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const get = async (collectionId, documentId) => {
  try {
    const response = await databases.getDocument(
      databaseId,
      collectionId,
      documentId
    );
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error al obtener documento ${documentId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Listar documentos con queries opcionales
 * @param {string} collectionId - ID de la colección
 * @param {array} queries - Array de queries de Appwrite (opcional)
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const list = async (collectionId, queries = []) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      queries
    );
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error al listar documentos en ${collectionId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualizar un documento
 * @param {string} collectionId - ID de la colección
 * @param {string} documentId - ID del documento
 * @param {object} data - Datos a actualizar
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const update = async (collectionId, documentId, data) => {
  try {
    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error al actualizar documento ${documentId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Eliminar un documento
 * @param {string} collectionId - ID de la colección
 * @param {string} documentId - ID del documento
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const remove = async (collectionId, documentId) => {
  try {
    await databases.deleteDocument(
      databaseId,
      collectionId,
      documentId
    );
    return { success: true };
  } catch (error) {
    console.error(`Error al eliminar documento ${documentId}:`, error);
    return { success: false, error: error.message };
  }
};