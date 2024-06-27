import { Html, Head, Main, NextScript } from "next/document";
import NavigationBar from "@/components/NavigationBar";


export default function Document() {
  return (
    <Html lang="en" className='bg-background text-text'>
      <Head />
      <body>
        <NavigationBar />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
