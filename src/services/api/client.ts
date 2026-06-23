import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function getBaseUrl(): string {
  // Em Expo Go, debuggerHost é algo como "192.168.1.8:8081"
  // Extraímos só o IP e trocamos a porta pelo backend (3000)
  const host = Constants.expoGoConfig?.debuggerHost;
  if (host) {
    const ip = host.split(':')[0];
    return `http://${ip}:3000/api`;
  }
  // Fallback para produção (troque pelo URL real do backend)
  return 'http://localhost:3000/api';
}

const BASE_URL = getBaseUrl();

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code, data?.error?.message);
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
};
