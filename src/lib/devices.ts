import devicePath from '../utils/devicePath.ts';
import { type ApiResult, apiFetch } from './api.ts';

export type DeviceRequestResult = {
  success: boolean;
  error?: string;
};

type DeviceFetch = (
  path: string,
  options: { method: 'PUT' | 'DELETE' }
) => Promise<ApiResult<unknown>>;

export async function requestDevice(
  registrationToken: string,
  method: 'PUT' | 'DELETE',
  fetchApi: DeviceFetch = apiFetch
): Promise<DeviceRequestResult> {
  const path = devicePath(registrationToken);

  if (!path) {
    return { success: false, error: 'Invalid registration token' };
  }

  const { error } = await fetchApi(path, { method });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
