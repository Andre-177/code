'use server';

import type { ZigbeeDevice } from './lib/types';
import { mqttClient } from '@/lib/mqtt-client';

export async function updateDeviceState(
  friendlyName: string,
  newState: Partial<Pick<ZigbeeDevice, 'state' | 'brightness'>>
) {
  try {
    const topic = `${mqttClient.baseTopic}/${friendlyName}/set`;
    const payload = JSON.stringify(newState);
    
    console.log(`Publishing to MQTT: Topic='${topic}', Payload='${payload}'`);
    await mqttClient.publish(topic, payload);

    // Revalidation is no longer needed as UI updates via MQTT WebSocket
    return { success: true, message: `Update command sent to ${friendlyName}.` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Failed to update device state:', error);
    return { success: false, message: `Failed to send update: ${errorMessage}` };
  }
}
