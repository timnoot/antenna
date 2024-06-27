import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex flex-col items-center justify-between ${inter.className}`}
    >
      <div className='m-64'>
        General Information
        Github WiKi
      </div>

      <div className=''>
        <Link href="/control" className='flex items-center bg-primary border-border border-2 p-2 rounded-md hover:bg-hover transition duration-300 ease-in-out'>
          <p className='m-2'>
            Go to Control Page
          </p>
          <Image
            src="/up-right-arrow.svg"
            alt="Vercel Logo"
            width={25}
            height={25}
            priority
          />
        </Link>
      </div>

    </main>
  );
}
