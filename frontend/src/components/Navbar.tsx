//Import Logo
import eduSign from '/logo/edusign-logo.svg'

function Navbar() {
    
    return (
        <div id='navbar' className='bg-white' >
            {/* logo + text */}
            <div className="flex items-center logo">
                <div style={{ width: '2rem' , height: '2rem'}}>
                    <img src={eduSign} alt="logo" />
                </div>
                <div className='text-xl atma-semibold'>EduSign</div>
            </div>
        </div>
    )
}

export default Navbar