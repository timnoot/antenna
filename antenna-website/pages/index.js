import { Inter } from "next/font/google";
import axios from "axios";
import MarkdownRenderer from '../components/MarkdownRenderer';
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






