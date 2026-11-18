import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import StyledComponentsRegistry from '@/lib/registry';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'QRForge – Free Custom QR Code Generator with Logo',
  description:
    'Create custom QR codes with logos, gradients, colors and shapes. Download PNG, SVG, JPEG and WEBP in high resolution. Free forever.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <StyledComponentsRegistry>
            <Providers>{children}</Providers>
          </StyledComponentsRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
