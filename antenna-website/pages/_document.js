import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className='bg-background text-text'>
      <Head />
      <script src="./js/leaflet/leaflet.js" type="text/javascript" />
      <script src="./js/leaflet/L.Terminator.js" type="text/javascript" />
      <script src="./js/satellite-js/dist/satellite.min.js" />
      <script src="https://unpkg.com/twemoji@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>

      <link rel="stylesheet" href="./js/leaflet/leaflet.css" />

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
