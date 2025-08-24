import type {NextConfig} from 'next';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

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
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  webpack: (config) => {
    config.plugins.push(
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'build', 'pdf.worker.min.mjs'),
                    to: path.join(path.dirname(config.output.path || ''), 'static', 'chunks'),
                },
            ],
        }),
    );
    return config;
  }
};

export default nextConfig;
