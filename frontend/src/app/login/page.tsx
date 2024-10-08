'use client'
import loginPage from '../styles/Auth.module.css'
import Image from 'next/image';
import logo from '../assets/logo.png';
import axios from 'axios';
import { SERVER_URL } from '../utils/constants';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const handleLogin = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/store`);
            router.push('/teams');
        } catch (error) {
            alert(error);
        }
    }
    
    return (
        <>
            <div className={loginPage['login-polygon']}></div>
            <div className={loginPage['info-container']}>
                <Image src={logo} alt="" width={400} />
                <br/>
                <div className={loginPage['form-container']}>
                    <input type="email" id="email" placeholder="Email" className={loginPage['input-field']} />
                    <input type="password" id="password" placeholder="Password" className={loginPage['input-field']} />
                    <a href="/forgot-password" className={loginPage.link}>Forgot Password?</a>
                </div>
                <button onClick={handleLogin} className={`${loginPage['auth-button']} ${loginPage['dark']} ${loginPage['long']}`}>Login</button>
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