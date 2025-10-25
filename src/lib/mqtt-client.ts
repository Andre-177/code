import mqtt, { IClientOptions } from 'mqtt';

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_BASE_TOPIC = process.env.MQTT_BASE_TOPIC || 'zigbee2mqtt';

// Create a new client instance, but only if one doesn't already exist.
// This is important for Next.js's hot-reloading in development.
declare global {
  var mqttClient: mqtt.MqttClient | undefined;
}

const connectionOptions: IClientOptions = {};
if (MQTT_USER) {
  connectionOptions.username = MQTT_USER;
}
if (MQTT_PASSWORD) {
  connectionOptions.password = MQTT_PASSWORD;
}

const client =
  global.mqttClient ||
  mqtt.connect(MQTT_URL, connectionOptions);

if (process.env.NODE_ENV !== 'production') {
  global.mqttClient = client;
}

client.on('connect', () => {
  console.log(`MQTT client connected to ${MQTT_URL}`);
});

client.on('error', (err) => {
  console.error('MQTT client error:', err);
  // No need to call client.end(), it will reconnect automatically
});

async function publish(topic: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      console.warn('MQTT client not connected, attempting to publish...');
      // Even if not connected, the library will queue the message and send upon reconnection.
    }
    client.publish(topic, message, (err) => {
      if (err) {
        console.error('MQTT publish error:', err);
        return reject(err);
      }
      resolve();
    });
  });
}

export const mqttClient = {
  publish,
  baseTopic: MQTT_BASE_TOPIC,
};
