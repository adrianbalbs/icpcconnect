/**
 * Code creation logic for:
 * F15ATOMATO-34    - Invite Codes for Coaches and Site Coordinators
 * F15ATOMATO-3     - Email Verification for Account Creation
 */

import {
    CreateAuthCodeRequest,
    CreateRoleCodeRequest
} from "../schemas/index.js"

const CODE_LENGTH = 6;

enum role {
    coach = 1,
    site_coord = 2
}

/**
 * createCode
 * 
 * Creates a random number with {length} total
 * digits between {10^length} and {10^(length + 1) - 1}
 * 
 * @param length: number
 * @returns number
 */
function createCode(length: number): number {
    return Math.floor(Math.random() * (9 * (10^length))) + (10^length);
}

/**
 * pushCodeCoach
 * 
 * Pushed a created code into the invite_codes table with a
 * coach role and its time of creation. 
 * 
 * @param null
 * @returns number (the code)
 */
function pushCodeCoach(): number {
    let coachCode: CreateRoleCodeRequest = {
        code: createCode(CODE_LENGTH),
        role: role.coach,
        createdAt: Date.now()
    }
    // Insert into DB

    return coachCode.code;
}   

/**
 * pushCodeSiteCoord
 * 
 * Pushed a created code into the invite_codes table with a
 * site_coord role and its time of creation. 
 * 
 * @param null
 * @returns number (the code)
 */
function pushCodeSiteCoord(): number {
    let coachCode: CreateRoleCodeRequest = {
        code: createCode(CODE_LENGTH),
        role: role.site_coord,
        createdAt: Date.now()
    }

    // Insert into DB

    return coachCode.code;
}


/**
 * pushCodeAuth
 * 
 * Pushed a created code into the auth_codes table with
 * the email assigned to the code, and its time of creation.
 * 
 * @param email: String
 * @returns number (the code)
 */
function pushCodeAuth(email: string): number {
    let coachCode: CreateAuthCodeRequest = {
        code: createCode(CODE_LENGTH),
        email: email,
        createdAt: Date.now(),
    }

    // Insert into DB

    return coachCode.code;
}