'use client';

import { updateDeviceState } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ZigbeeDevice } from '@/lib/types';
import {
  CircleDot,
  Lightbulb,
  Thermometer,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { useTransition } from 'react';

function DeviceIcon({ device }: { device: ZigbeeDevice }) {
  const isLight = device.definition?.exposes.some((e) => e.type === 'light');
  if (isLight) {
    return <Lightbulb className="h-5 w-5 text-muted-foreground" />;
  }

  const isSwitch = device.definition?.exposes.some((e) => e.type === 'switch');
  if (isSwitch) {
    return <ToggleRight className="h-5 w-5 text-muted-foreground" />;
  }

  const isSensor =
    device.definition?.exposes.some((e) => e.name === 'temperature') ||
    device.definition?.exposes.some((e) => e.name === 'humidity');
  if (isSensor) {
    return <Thermometer className="h-5 w-5 text-muted-foreground" />;
  }

  return <CircleDot className="h-5 w-5 text-muted-foreground" />;
}

export function DeviceCard({ device }: { device: ZigbeeDevice }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStateChange = (newState: { state: 'ON' | 'OFF' }) => {
    startTransition(async () => {
      const { success, message } = await updateDeviceState(
        device.friendly_name,
        newState
      );
      if (!success) {
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } else {
        // Optimistic update handled by MQTT, no success toast needed
      }
    });
  };

  const isLight = device.definition?.exposes.some(
    (e) => e.type === 'light' && e.name === 'state'
  );
  const isOn = device.state === 'ON';

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isOn && isLight ? 'bg-accent/10 border-accent/40' : 'bg-card'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">
            {device.friendly_name}
          </CardTitle>
          <CardDescription>
            {device.definition?.vendor} {device.definition?.model}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {device.state && (
            <Badge
              variant={isOn ? 'default' : 'secondary'}
              className={cn(
                'transition-colors',
                isOn && 'bg-accent text-accent-foreground'
              )}
            >
              {device.state}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <DeviceIcon device={device} />
            <div className="flex gap-4">
              {device.temperature !== undefined && (
                <span>{device.temperature}°C</span>
              )}
              {device.humidity !== undefined && <span>{device.humidity}%</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLight && (
              <Switch
                checked={isOn}
                onCheckedChange={(checked) =>
                  handleStateChange({ state: checked ? 'ON' : 'OFF' })
                }
                disabled={isPending}
                aria-label={`Toggle ${device.friendly_name}`}
              />
            )}
            {/* More actions can be added here later */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
