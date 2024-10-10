'use client'
import registerPage from '../styles/Auth.module.css'
import { useState } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../utils/constants';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [university, setUniversity] = useState(0);
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [eligibility, setEligibility] = useState(false);
    const [checked, setChecked] = useState(false);


    const handleRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
    }

    const submitForm = async () => {
        try {
            const payload = {
                firstName,
                lastName,
                role,
                university,
                studentId,
                email,
                verificationCode,
                password,
            };
            alert(`Successfully registered user ${firstName} ${lastName}`)
            const response = await axios.post(`${SERVER_URL}/register`, payload);
            console.log('User registered:', response.data);
            router.push('/login');
        } catch (error) {
            console.error('Registration failed:', error);
        }
    }

    const handleNext = () => {
        if (step === 5 && (password === '' || confirmPassword === '')) {
            alert("Please enter a password.");
        } else if (step === 5 && !checked) {
            alert("Please agree to the Terms and Conditions.");
        } else if (step === 5 && password === confirmPassword) {
            submitForm();
        } else if (step === 4 && verificationCode === '') {
            alert("Please enter a verification code.");
        } else if (step === 3 && (university === 0 || studentId === '' || email === '')) {
            alert("Please fill in the page.");
        } else if (step === 2 && role === 'Student' && !eligibility) {
            alert("You have not declared yourself eligible for the competition.");
        } else if (step === 1 && (firstName === '' || lastName === '' || role === '')) {
            alert("Please fill in the page.");
        } else {
            setStep((curStep) => curStep + 1);
        }
    }

    const handleBack = () => {
        setStep((curStep) => curStep - 1)
        if (step === 3) {
            setEligibility(false);
            role !== 'Student' ? setStep((curStep) => curStep - 1) : setStep(1);
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
                            <input placeholder="First Name" className={registerPage['input-field-short']} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <input placeholder="Last Name" className={registerPage['input-field-short']} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <select value={role} onChange={handleRole} id="select-role" name="Select Role" className={registerPage['input-field']}>
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
                        {role === 'Student' ? (
                            <>
                                <h1>Do you meet the ICPC eligibility rules?</h1>
                                <p>
                                    The full eligbility rules can be found at &nbsp;
                                    <a href='https://icpc.global/regionals/rules/'>https://icpc.global/regionals/rules/</a>,
                                    but the most notable criteria are:
                                    <ul>
                                        <li>enrolled in a degree program at the team's institution</li>
                                        <li>taking at least 1/2 load, or co-op, exchange or intern student</li>
                                        <li>have not competed in two ICPC World Finals</li>
                                        <li>have not competed in ICPC regional contests in five different years</li>
                                        <li>commenced post secondary studies in 2020 or later OR born in 2001 or later.</li>
                                    </ul>
                                    You must meet the enrolment criteria in the term(s) that the contest is running. 
                                    If any team members are not ICPC eligible, then the team will not be considered for qualification to Regional Finals.
                                </p>
                                <div className={registerPage['vertical-container']}>
                                    <label><input type="radio" name="eligbility" value="true" onChange={(e) => setEligibility(true)} />Yes</label>
                                    <label><input type="radio" name="eligbility" value="false" onChange={(e) => setEligibility(false)} />No</label>
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
                        <h1>{role}</h1>
                        <select id="select-university" name="Select University" className={registerPage['input-field']} value={university} onChange={(e) => setUniversity(Number(e.target.value))}>
                            <option value={0} disabled selected>Select University</option>
                            <option value={1}>UNSW</option>
                            <option value={2}>University of Sydney</option>
                            <option value={3}>University of Technology Sydney</option>
                            <option value={4}>Macquarie University</option>
                        </select>
                        <div className={registerPage['form-container']}>
                            <input placeholder="Student ID" className={registerPage['input-field']} value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                            <input placeholder="Email" className={registerPage['input-field']} value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 4 && (
                    <>
                        <h1>Verify email address</h1>
                        <h1>{role}</h1>
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
                        <h1>{role}</h1>
                        <input type="password" placeholder="Password" className={registerPage['input-field']} value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <input type="password" placeholder="Confirm Password" className={registerPage['input-field']} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                        {password !== confirmPassword && (
                            <p style={{ color: "red" }}>Passwords do not match.</p>
                        )}
                        <label htmlFor="tnc">
                            <input id="tnc" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                            &nbsp;Yes, I agree to the <a className="link">Terms and Conditions of Use</a>
                        </label>
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


