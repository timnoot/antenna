import 'react';

const Footer = ({
    sticky = false,
}) => {
    if (sticky) {
        return (
            <footer className='fixed bottom-0 w-full'>
                <div className='flex flex-col items-center justify-center bg-secondary bg-opacity-80 text-white p-2'>
                    © 2024 LiS Dream Team - Instrumentation For Space - Moonshots24
                </div>
            </footer>
        );
    } else {
        return (
            <footer>
                <div className='flex items-center justify-center bg-secondary bg-opacity-80 text-white p-2 w-full text-center'>
                    © 2024 LiS Dream Team
                    <div className='hidden sm:inline-block ml-1.5'>
                        - Instrumentation For Space - Moonshots24
                    </div>
                </div>
            </footer>
        );
    }
};


export default Footer;
