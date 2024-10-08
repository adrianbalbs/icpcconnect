'use client'
import registerPage from '../styles/Auth.module.css'
import { useState } from 'react';


export default function Register() {
    const [step, setStep] = useState(1);
    
    const handleNext = () => {
        setStep((curStep) => curStep + 1);
        console.log(step);
    }

    const handleBack = () => {
        setStep((curStep) => curStep - 1);
    }

    return (
        <>
            <div className={registerPage['register-polygon']}></div>
            <div className={registerPage['info-container']}>
                {step === 1 && (
                    <>
                        <h1>Create an account</h1>
                        <div className={registerPage['horizontal-container']}>
                            <input placeholder="First Name" className={registerPage['input-field-short']} />
                            <input placeholder="Last Name" className={registerPage['input-field-short']} />
                        </div>
                        <select id="select-role" name="Select Role" className={registerPage['input-field']}>
                            <option value="" disabled selected>Select Role</option>
                            <option value="student">Student</option>
                            <option value="coach">Coach</option>
                            <option value="site-coordinator">Site Coordinator</option>
                        </select>
                        <div className={registerPage['horizontal-container']}>
                            <a href={"/login"} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back to Login</a>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 2 && (
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
                            <label><input type="radio" value="1" />Yes</label>
                            <label><input type="radio" value="0" />No</label>
                        </div>
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h1>Enter your details</h1>
                        <select id="select-university" name="Select University" className={registerPage['input-field']}>
                            <option value="" disabled selected>Select University</option>
                            <option value="student">UNSW</option>
                            <option value="coach">University of Sydney</option>
                            <option value="site-coordinator">Western Sydney University</option>
                        </select>
                        <div className={registerPage['form-container']}>
                            <input placeholder="Invite Code" className={registerPage['input-field']} />
                            <input placeholder="Email" className={registerPage['input-field']} />
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
                        <input placeholder="Enter Verification Code" className={registerPage['input-field']} />
                        <div className={registerPage['horizontal-container']}>
                            <button onClick={handleBack} className={`${registerPage['auth-button']} ${registerPage['white']} ${registerPage['short']}`}>Back</button>
                            <button onClick={handleNext} className={`${registerPage['auth-button']} ${registerPage['dark']} ${registerPage['short']}`}>Next</button>
                        </div>
                    </>
                )}
                {step === 5 && (
                    <>
                        <h1>Create a password</h1>
                        <input placeholder="Password" className={registerPage['input-field']} />
                        <input type="password" placeholder="Confirm Password" className={registerPage['input-field']} />
                        <label htmlFor="tnc">
                            <input id="tnc" type="checkbox" />
                            &nbsp;Yes, I agree to the <a className="link" href="/">Terms and Conditions of Use</a>
                        </label>
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


