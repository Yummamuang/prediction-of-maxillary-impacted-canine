//Import Logo
import eduSign from '/logo/edusign-logo.svg'

//Styles
import './index.css'

function Navbar() {
    
    return (
        <div id='navbar' className='bg-white p-3 flex justify-between' >
            {/* logo + text */}
            <div className="flex items-center logo">
                <div style={{ width: '2.6rem' , height: '2.6rem'}}>
                    <img src={ eduSign } alt="logo" />
                </div>
                <div className='text-2xl atma-semibold'>EduSign</div>
            </div>
            {/* Hamberger Bars */}
            <div className='flex items-center'>
                <svg id='hamberger-bars' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#111624" className="w-8 h-8">
                    <g>
                        <path id='line1' strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75" />
                        <path id='line2' strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75" />
                        <path id='line3' strokeLinecap="round" strokeLinejoin="round" d="M3.75 17.25h12.5M3.75" />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default Navbar