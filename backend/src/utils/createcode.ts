/**
 * Code creation logic for:
 * F15ATOMATO-34    - Invite Codes for Coaches and Site Coordinators
 * F15ATOMATO-3     - Email Verification for Account Creation
 */

import {
    CreateAuthCodeRequest,
    CreateRoleCodeRequest
} from "../schemas/index.js"
import {
    CodesService
} from "../services/codes-service.js";

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
export async function pushCodeCoach(codesService: CodesService) {
    let coachCode: CreateRoleCodeRequest = {
        code: createCode(CODE_LENGTH),
        role: role.coach,
        createdAt:new Date(Date.UTC(Date.now()))
    }
    
    const code = codesService.createRoleCode(coachCode);

    return code;
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
export function pushCodeSiteCoord(codesService: CodesService) {
    let siteCoordCode: CreateRoleCodeRequest = {
        code: createCode(CODE_LENGTH),
        role: role.site_coord,
        createdAt:new Date(Date.UTC(Date.now()))
    }

    const code = codesService.createRoleCode(siteCoordCode);

    return code;
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
export function pushCodeAuth(codesService: CodesService, email: string) {
    let authCode: CreateAuthCodeRequest = {
        code: createCode(CODE_LENGTH),
        email: email,
        createdAt:new Date(Date.UTC(Date.now()))
    }

    const code = codesService.createAuthCode(authCode);

    return code;
}