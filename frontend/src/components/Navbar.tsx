//Import Logo
import eduSign from '/logo/edusign-logo.svg'

//Styles
import './index.css'

//React
import { useRef, useState } from 'react'

function Navbar() {

    // ==== Styling Hamberger Bars ==== //
    const hambergerBars = useRef<HTMLDivElement>(null);
    const line1 = useRef<SVGPathElement>(null);
    const line2 = useRef<SVGPathElement>(null);
    const line3 = useRef<SVGPathElement>(null);

    // Check if menu is open
    let [isOpen, setIsOpen] = useState(false);

    // Open Menu Function
    const openMenu = () => {
        return () => {
            // Set Open to True
            setIsOpen(true);

            // Set Pointer Events to None
            hambergerBars.current!.classList.add('pointer-events-none');

            // Style Lines
            line1.current!.style.transform = 'rotate(45deg) translate(5px, -5px)';
            line2.current!.style.transform = 'rotate(-45deg) translate(-7px, -12px)';
            line3.current!.style.opacity = '0';

            // Delay
            setTimeout(() => {
                hambergerBars.current!.classList.remove('pointer-events-none');
            }, 800);
        }
    }

    // Close Menu Function
    const closeMenu = () => {
        return () => {
            // Set Open to False
            setIsOpen(false);

            // Set Pointer Events to None
            hambergerBars.current!.classList.add('pointer-events-none');

            // Style Lines
            line1.current!.style.transform = 'rotate(0) translate(0, 0)';
            line2.current!.style.transform = 'rotate(0) translate(0, 0)';
            line3.current!.style.opacity = '1';

            // Delay
            setTimeout(() => {
                hambergerBars.current!.classList.remove('pointer-events-none');
            }, 800);
        }
    }


    return (
        <div id='navbar' className='bg-white p-3 flex justify-between' >

            {/* logo + text */}
            <div className="flex items-center logo">
                <div style={{ width: '2.6rem', height: '2.6rem' }}>
                    <img src={eduSign} alt="logo" />
                </div>
                <div className='text-2xl atma-semibold'>EduSign</div>
            </div>

            {/* Hamberger Bars */}
            <div className='flex items-center' ref={hambergerBars} onClick={ isOpen ? closeMenu() : openMenu() } >
                <svg id='hamberger-bars' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#111624" className="w-8 h-8">
                    <g>
                        <path id='line1' ref={line1} strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5" />
                        <path id='line2' ref={line2} strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
                        <path id='line3' ref={line3} strokeLinecap="round" strokeLinejoin="round" d="M3.75 17.25h16.5" />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default Navbar