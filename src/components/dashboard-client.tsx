'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ZigbeeDevice } from '@/lib/types';
import { useEffect, useState } from 'react';
import { DeviceCard } from './device-card';
import mqtt from 'mqtt';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

const MQTT_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL || 'localhost:1883';
const MQTT_BASE_TOPIC = process.env.NEXT_PUBLIC_MQTT_BASE_TOPIC || 'zigbee2mqtt';

// Helper to check if a device is a controllable light
const isControllableLight = (d: ZigbeeDevice) =>
  d.definition?.exposes.some((e) => e.type === 'light' && e.name === 'state');

export function DashboardClient() {
  const [devices, setDevices] = useState<Record<string, ZigbeeDevice>>({});
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL);

    client.on('connect', () => {
      setConnectionStatus('Connected');
      console.log('Connected to MQTT broker via WebSocket');

      // Subscribe to the main devices topic
      client.subscribe(`${MQTT_BASE_TOPIC}/bridge/devices`, (err) => {
        if (err) {
          console.error('Subscription error:', err);
          setConnectionStatus('Subscription failed');
        }
      });

      // Subscribe to all device status topics
      client.subscribe(`${MQTT_BASE_TOPIC}/#`, (err) => {
        if(err) console.error("failed to subscribe to all topics")
      });
    });

    client.on('reconnect', () => {
      setConnectionStatus('Reconnecting...');
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
      setConnectionStatus('Error');
      client.end();
    });

    client.on('message', (topic, message) => {
      try {
        const messageString = message.toString();
        // Don't parse empty messages
        if (!messageString) return;
        const payload = JSON.parse(messageString);
        
        if (topic === `${MQTT_BASE_TOPIC}/bridge/devices`) {
          const deviceList: ZigbeeDevice[] = payload;
          setDevices((prevDevices) => {
            const newDevices: Record<string, ZigbeeDevice> = {};
            deviceList.forEach((device) => {
              // We only care about devices that are not the coordinator
              if (device.type !== 'Coordinator') {
                 newDevices[device.friendly_name] = { 
                   ...(prevDevices[device.friendly_name] || {}), 
                   ...device 
                 };
              }
            });
            return newDevices;
          });
          // After receiving the device list, subscribe to their topics
          deviceList.forEach(device => {
            if (device.type !== 'Coordinator') {
              client.subscribe(`${MQTT_BASE_TOPIC}/${device.friendly_name}`, (err) => {
                if(err) console.error(`Failed to subscribe to ${device.friendly_name}`);
              })
            }
          });
        } else if (
            topic.startsWith(MQTT_BASE_TOPIC) && 
            topic !== `${MQTT_BASE_TOPIC}/bridge/info` && 
            topic !== `${MQTT_BASE_TOPIC}/bridge/state` && 
            topic !== `${MQTT_BASE_TOPIC}/bridge/devices` && 
            topic !== `${MQTT_BASE_TOPIC}/bridge/logging` &&
            !topic.endsWith("/set") // Ignore our own set commands
        ) {
            const friendlyName = topic.substring(MQTT_BASE_TOPIC.length + 1);
            setDevices(prev => {
              if (prev[friendlyName]) {
                return {
                  ...prev,
                  [friendlyName]: {
                    ...prev[friendlyName],
                    ...payload,
                  }
                }
              }
              return prev;
            });
        }
      } catch (e) {
               console.error('Error processing MQTT message:', e, 'on topic', topic);
      }
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);

  const deviceList = Object.values(devices);
  const controllableLights = deviceList.filter(isControllableLight);

  if (connectionStatus !== 'Connected') {
    return (
       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>MQTT Connection</AlertTitle>
        <AlertDescription>
          {connectionStatus} to broker at {MQTT_URL}...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">All Devices</h2>
        {deviceList.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deviceList.map((device) => (
              <DeviceCard
                key={device.ieee_address}
                device={device}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-10">
                <p className="text-sm text-muted-foreground">
                  Waiting for devices from MQTT...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
