import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    // For server-side MQTT client (TCP)
    MQTT_URL: process.env.MQTT_URL,
    MQTT_USER: process.env.MQTT_USER,
    MQTT_PASSWORD: process.env.MQTT_PASSWORD,
    // For client-side MQTT client (WebSocket)
    NEXT_PUBLIC_MQTT_WS_URL: process.env.NEXT_PUBLIC_MQTT_WS_URL,
    // For both clients
    NEXT_PUBLIC_MQTT_BASE_TOPIC: process.env.NEXT_PUBLIC_MQTT_BASE_TOPIC,
  }
};

export default nextConfig;
