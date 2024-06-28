import Image from "next/image";
import Link from "next/link";

const NavigationBar = () => {
	return (
		<div className="bg-primary border-border border-2 p-4 w-full flex justify-center items-center h-[82px] relative">
			<Link href="/" className="relative flex items-center justify-center">
				<h1 className="text-sm sm:text-2xl md:text-2xl lg:text-4xl font-bold text-center flex items-center">
					<div className='hidden md:inline-block mr-1.5'>
						Welcome to the
					</div>
					<div className='hidden xs:inline-block'>
						NOA Satellite Tracker Website
					</div>
				</h1>
			</Link>
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
	);
};

export default NavigationBar;
