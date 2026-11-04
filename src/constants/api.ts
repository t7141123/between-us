/**
 * Base API URL configuration for cross-platform compatibility.
 * Web uses relative paths ('') to respect current origin.
 * Native (iOS/Android) targets the production domain.
 */
import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'web' ? '' : 'https://between-us.ark-studio.app';
