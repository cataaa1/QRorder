import type { NextConfig } from "next";

function hostnameFromUrl(rawUrl: string | undefined) {
  if (!rawUrl) {
    return null;
  }

  try {
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
}

// El bucket de imagenes del menu vive en el proyecto de Supabase configurado por
// entorno, asi que el hostname permitido se deriva de la misma variable en lugar
// de quedar hardcodeado a un proyecto puntual.
const supabaseHostname = hostnameFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

// En dev el flujo del comensal se prueba desde el celular contra la IP de
// Tailscale (ver README). Sin esto Next avisa por cada request a /_next/* y en
// una major futura las va a bloquear.
const appHostname = hostnameFromUrl(process.env.NEXT_PUBLIC_APP_URL);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: appHostname ? [appHostname] : [],
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
