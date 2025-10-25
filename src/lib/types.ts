export interface ZigbeeDevice {
  ieee_address: string;
  friendly_name: string;
  type: 'EndDevice' | 'Router' | 'Coordinator';
  definition?: {
    model: string;
    vendor: string;
    description: string;
    exposes: {
      type: 'light' | 'switch' | 'binary' | 'numeric';
      features?: any[];
      property: string;
      name: string;
    }[];
  };
  power_source?: string;
  model_id?: string;
  // This state is not from the initial devices list, but from device-specific topics
  state?: 'ON' | 'OFF';
  brightness?: number;
  temperature?: number;
  humidity?: number;
}

export interface Section {
  id: string;
  name: string;
  device_ids: string[];
}
