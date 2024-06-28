import Image from "next/image";
import Link from "next/link";

const NavigationBar = () => {
	return (
		<div className="bg-primary border-border border-2 p-4 w-full flex justify-center items-center h-[82px] relative">
			<Link href="/" className="relative flex items-center justify-center">
				<h1 className="text-2xl lg:text-4xl font-bold text-center">
					Welcome to the NOA Satellite Tracker Website
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
