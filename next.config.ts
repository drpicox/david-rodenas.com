import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: 'export',  // Enables static exports
    images: {
        unoptimized: true, // Required for static export
    },
    // Required if you'll deploy to a subfolder
    basePath: '',
    // Required for GitHub Pages
    assetPrefix: '',
};

export default nextConfig;
