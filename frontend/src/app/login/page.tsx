import loginPage from '../styles/Auth.module.css'
import Image from 'next/image';
import logo from '../assets/logo.png';

export default function Login() {
    return (
        <>
            <div className={loginPage['login-polygon']}></div>
            <div className={loginPage['info-container']}>
                <Image src={logo} alt="" width={400} />
                <div className={loginPage['form-container']}>
                    <input type="email" id="email" placeholder="Email" className={loginPage['input-field']} />
                    <input type="password" id="password" placeholder="Password" className={loginPage['input-field']} />
                    <a href="/forgot-password" className={loginPage.link}>Forgot Password?</a>
                </div>
                <a href={'/'} className={`${loginPage['auth-button']} ${loginPage['dark']} ${loginPage['long']}`}>Login</a>
                <div className={loginPage['horizontal-container']}>
                    <hr></hr>
                    or
                    <hr></hr>
                </div>
                <div className={loginPage['horizontal-container']}>
                    Don't have an account?&nbsp;
                    <a href="register" className={loginPage.link}>Register</a>
                </div>
            </div>
        </>
    );
}