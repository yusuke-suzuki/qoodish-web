'use server';

import { type DeviceRequestResult, requestDevice } from '../lib/devices.ts';

export async function registerDevice(
  registrationToken: string
): Promise<DeviceRequestResult> {
  return requestDevice(registrationToken, 'PUT');
}

export async function unregisterDevice(
  registrationToken: string
): Promise<DeviceRequestResult> {
  return requestDevice(registrationToken, 'DELETE');
}
