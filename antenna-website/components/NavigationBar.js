import Image from "next/image";
import Link from "next/link";
import EmojiComponent from "./EmojiComponent";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const NavigationBar = () => {
	const router = useRouter();
	const [hideControlLink, setHideControlLink] = useState(false);

	useEffect(() => {
		setHideControlLink(router.pathname === '/control');
	}, [router.pathname]);

	return (
		<>
			<div className="bg-primary border-border border-2 p-4 w-full flex justify-center items-center h-[82px] fixed">
				<Link href="/" className="absolute left-2 top-0">
					<Image
						src="/satellite.svg"
						alt="Project Logo"
						width={50}
						height={50}
						priority
						className="m-4"
					/>
				</Link>

				<Link href="/" className="relative flex items-center justify-center">
					<h1 className="text-sm sm:text-xl md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl 3xl:text-5xl font-bold text-center flex items-center mr-2">
						<div className='hidden md:inline-block mr-1.5'>
							Welcome to the
						</div>
						<div className='hidden xs:inline-block'>
							NOAA Satellite Tracker Website
						</div>
					</h1>
				</Link>

				<div className={`absolute right-[102px] top-[14.4px] ${hideControlLink ? 'hidden' : 'hidden lg:block'}`}>
					<Link href="/control" className='text-2xl flex items-center bg-primary border-border border-2 p-2 rounded-md hover:bg-hover transition duration-300 ease-in-out'>
						<EmojiComponent text='Control Page ↗️' />
					</Link>
				</div>
				<Link href="https://www.lis.nl/" className="absolute right-2 top-0">
					<Image
						src="/lis.png"
						alt="LiS Logo"
						width={64}
						height={50}
						priority
						className="m-4"
					/>
				</Link>
			</div>
			<div className="h-[82px]"></div>
		</>
	);
};

export default NavigationBar;
