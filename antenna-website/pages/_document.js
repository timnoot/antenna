import { Html, Head, Main, NextScript } from "next/document";
import NavigationBar from "@/components/NavigationBar";


export default function Document() {
  return (
    <Html lang="en" className='bg-background text-text'>
      <Head />
      <script src="./js/leaflet/leaflet.js" type="text/javascript" />
      <script src="./js/leaflet/L.Terminator.js" type="text/javascript" />
      <script src="./js/satellite-js/dist/satellite.min.js" />
      <script src="https://twemoji.maxcdn.com/v/latest/twemoji.min.js" crossorigin="anonymous"></script>

      <link rel="stylesheet" href="./js/leaflet/leaflet.css" />

      <body>
        <NavigationBar />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
