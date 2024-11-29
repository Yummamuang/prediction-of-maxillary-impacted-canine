//Logo
import eduSign from '../../public/logo/edusign-logo.svg'

function Navbar() {
    
    return (
        <div>
            <div className="logo">
                <div style={{ width: '50px' , height: '50px'}}>
                    <img src={eduSign} alt="logo" />
                </div>
                
            </div>
        </div>
    )
}

export default Navbar