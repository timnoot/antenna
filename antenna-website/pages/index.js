import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import MarkdownRenderer from '../components/MarkdownRenderer';
import EmojiComponent from "../components/EmojiComponent";
import Footer from '../components/Footer';

const inter = Inter({ subsets: ["latin"] });

export default function Home({ readme }) {
  return (
    <>
      <main
        className={`flex flex-col items-center justify-between ${inter.className}`}
      >
        <div className='m-12'>
          <MarkdownRenderer markdown={readme} />
        </div>

        <div className='fixed bottom-6 right-[20%] hidden lg:block'>
          <Link href="/control" className='text-2xl flex items-center bg-primary border-border border-2 p-2 rounded-md hover:bg-hover transition duration-300 ease-in-out'>
            <EmojiComponent text='Go to Control Page ↗️' />
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}

export async function getStaticProps() {
  const res = await axios.get('https://raw.githubusercontent.com/timnoot/antenna/main/README.md');

  const readme = res.data;
  if (res.status !== 200) {
    console.error(json);
    throw new Error('Failed to fetch API');
  }

  return {
    props: {
      readme,
    },
    revalidate: 300,
  };
}






