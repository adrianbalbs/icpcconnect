'use client'
import registerPage from '../styles/Auth.module.css'
import { useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../utils/constants';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [roleName, setRoleName] = useState('');
    const [givenName, setgivenName] = useState('');
    const [familyName, setfamilyName] = useState('');
    const [university, setUniversity] = useState('');
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [checked, setChecked] = useState(false);

    const handleRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRoleName(e.target.value);
    }
    
    const convertRole: { [key: string]: string } = {
        Student: "student",
        "Site Coordinator": "site_coordinator",
        Coach: "coach",
    };
    
    const handleNext = async () => {
        if (step === 5) {
            try {
                if (password === confirmPassword && checked) {
                    let role = convertRole[roleName];
                    if (roleName === "Site Coordinator") {
                        role = "site_coordinator";
                        const payload = {
                            givenName,
                            familyName,
                            role,
                            university, // change this to uni_code later
                            email,
                            password,
                            inviteCode,
                        };
                        await axios.post(`${SERVER_URL}/api/site-coordinators`, payload);
                    } else if (roleName === "Coach") {
                        role = "coach";
                        const payload = {
                            givenName,
                            familyName,
                            role,
                            university, // change this to uni_code later
                            email,
                            password,
                            inviteCode,
                        };
                        await axios.post(`${SERVER_URL}/api/coaches`, payload);
                    } else {
                        role = "student";
                        const payload = {
                            givenName,
                            familyName,
                            role,
                            studentId,
                            university,
                            email,
                            password,
                        };
                        await axios.post(`${SERVER_URL}/api/students`, payload);
                    }
                    router.push('/login');
                } else if (password !== confirmPassword) {
                    console.log("Passwords do not match");
                } else {
                    console.log("Please agree to the terms and conditions.");
                }
            } catch (error) {
                console.error('Registration failed:', error);
            }
        } else {
            setStep((curStep) => curStep + 1);
        }
    }

    const handleBack = () => {
        setStep((curStep) => curStep - 1)
        if (step === 3) {
            if (roleName !== 'Student') {
                setStep((curStep) => curStep - 1);
            } else {
                setStep(1);
            }
        }
    }

    return (
        <>
            <div className={registerPage['register-polygon']}></div>
            <div className={registerPage['info-container']}>
                {step === 1 && (
                    <>
                        <h1>Create an account</h1>
                        <div className={registerPage['horizontal-container']}>
                            <input placeholder="First Name" className={registerPage['input-field-short']} value={givenName} onChange={(e) => setgivenName(e.target.value)} />
                            <input placeholder="Last Name" className={registerPage['input-field-short']} value={familyName} onChange={(e) => setfamilyName(e.target.value)} />
                        </div>
                        <select value={roleName} onChange={handleRole} id="select-role" name="Select Role" className={registerPage['input-field']}>
                            <option value="" disabled selected>Select Role</option>
                            <option value="Student">Student</option>
                            <option value="Coach">Coach</option>
                            <option value="Site Coordinator">Site Coordinator</option>
                        </select>
                        <div className={registerPage['horizontal-container']}>
                            <a href={"/login"} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back to Login</a>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        {roleName === 'Student' ? (
                            <>
                                <h1>Do you meet the ICPC eligibility rules?</h1>
                                <p>
                                    The full eligbility rules can be found at &nbsp;
                                    <a href='https://icpc.global/regionals/rules/'>https://icpc.global/regionals/rules/</a>,
                                    but the most notable criteria are:
                                    <ul>
                                        <li>enrolled in a degree program at the team&apos;s institution</li>
                                        <li>taking at least 1/2 load, or co-op, exchange or intern student</li>
                                        <li>have not competed in two ICPC World Finals</li>
                                        <li>have not competed in ICPC regional contests in five different years</li>
                                        <li>commenced post secondary studies in 2020 or later OR born in 2001 or later.</li>
                                    </ul>
                                    You must meet the enrolment criteria in the term(s) that the contest is running. 
                                    If any team members are not ICPC eligible, then the team will not be considered for qualification to Regional Finals.
                                </p>
                                <div className={registerPage['vertical-container']}>
                                    <label><input type="radio" value="1" />Yes</label>
                                    <label><input type="radio" value="0" />No</label>
                                </div>
                                <div className={registerPage['horizontal-container']}>
                                    <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                                    <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                                </div>
                            </>
                        ) : (
                            handleNext()
                        )}
                    </>
                )}
                {step === 3 && (
                    <>
                        <h1>Enter your details</h1>
                        <h1>{roleName}</h1>
                        <select id="select-university" name="Select University" className={registerPage['input-field']} value={university} onChange={(e) => setUniversity(e.target.value)}>
                            <option value="" disabled selected>Select University</option>
                            <option value="student">UNSW</option>
                            <option value="coach">University of Sydney</option>
                            <option value="site-coordinator">Western Sydney University</option>
                        </select>
                        {roleName === 'Student' ? (
                            <div className={registerPage['form-container']}>
                                <input placeholder="Student ID" className={registerPage['input-field']} value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                                <input placeholder="Email" className={registerPage['input-field']} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        ) : (
                            <div className={registerPage['form-container']}>
                                <input placeholder="Invite Code" className={registerPage['input-field']} value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}/>
                                <input placeholder="Email" className={registerPage['input-field']} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        )}
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 4 && (
                    <>
                        <h1>Verify email address</h1>
                        <h1>{roleName}</h1>
                        <input placeholder="Enter Verification Code" className={registerPage['input-field']} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 5 && (
                    <>
                        <h1>Create a password</h1>
                        <h1>{roleName}</h1>
                        <input type="password" placeholder="Password" className={registerPage['input-field']} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <input type="password" placeholder="Confirm Password" className={registerPage['input-field']} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                        <label htmlFor="tnc">
                            <input id="tnc" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                            &nbsp;Yes, I agree to the <a className="link" href="/https://icpc.global/regionals/rules">Terms and Conditions of Use</a>
                        </label>
                        {password !== confirmPassword && (
                            <p style={{ color: "red" }}>Passwords do not match.</p>
                        )}
                        {!checked && (
                            <p style={{ color: "red" }}>Please agree to the terms and conditions.</p>
                        )}
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Register</button>
                        </div>
                    </>
                )}
                {/* Unimplemented Progress Bar */}
                <div className={registerPage['progress-bar']}></div>
            </div>
        </>
    );
}