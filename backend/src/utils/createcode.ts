/**
 * Code creation logic for:
 * F15ATOMATO-34    - Invite Codes for Coaches and Site Coordinators
 * F15ATOMATO-3     - Email Verification for Account Creation
 */

import { AuthCodes, InviteCodes } from "../db/schema.js";
import {
  CreateAuthCodeRequest,
  CreateRoleCodeRequest,
} from "../schemas/index.js";
import { CodesService } from "../services/codes-service.js";

export enum role {
  coach = 1,
  site_coord = 2,
}

/**
 * Creates a random 6 digit long code
 *
 * @returns number
 */
export function generateSixDigitCode(): number {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  const coachCode: CreateRoleCodeRequest = {
    code: generateSixDigitCode(),
    role: role.coach,
  };

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
export async function pushCodeSiteCoord(codesService: CodesService) {
  const siteCoordCode: CreateRoleCodeRequest = {
    code: generateSixDigitCode(),
    role: role.site_coord,
  };

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
export async function pushCodeAuth(codesService: CodesService, email: string) {
  const authCode: CreateAuthCodeRequest = {
    code: generateSixDigitCode(),
    email: email,
  };

  const code = codesService.createAuthCode(authCode);

  return code;
}

/**
 * checkCoachCode
 *
 * Checks whether a given code is a valid coach invite code
 *
 * @param codesService CodesService
 * @param checkCode string
 * @returns boolean
 */
export async function checkCoachCode(
  codesService: CodesService,
  checkCode: string | undefined,
): Promise<boolean> {
  const codes: InviteCodes[] = await codesService.getAllRoleCodes();

  if (checkCode === undefined) {
    return false;
  }

  for (const code of codes) {
    if (code.code === Number(checkCode) && code.role === role.coach) {
      const expireTime: Date = addDays(new Date(code.createdAt), 1);
      const now: Date = new Date(Date.now());

      // Is the right code and role but it is expired
      if (expireTime.getTime() < now.getTime()) {
        return false;
      }

      // Success!
      return true;
    }
  }

  return false;
}

/**
 * checkSiteCoordCode
 *
 * Checks whether a given code is a valid site coordinator invite code
 *
 * @param codesService CodesService
 * @param checkCode string
 * @returns boolean
 */
export async function checkSiteCoordCode(
  codesService: CodesService,
  checkCode: string | undefined,
): Promise<boolean> {
  const codes: InviteCodes[] = await codesService.getAllRoleCodes();

  if (checkCode === undefined) {
    return false;
  }

  for (const code of codes) {
    if (code.code === Number(checkCode) && code.role === role.site_coord) {
      const expireTime: Date = addDays(new Date(code.createdAt), 1);
      const now: Date = new Date(Date.now());

      // Is the right code and role but it is expired
      if (expireTime.getTime() < now.getTime()) {
        return false;
      }

      // Success!
      return true;
    }
  }

  return false;
}

/**
 * checkAuthCode
 *
 * Checks whether an authentication code is valid
 *
 * @param codesService CodesService
 * @param checkCode number
 * @param email string
 * @returns
 */
export async function checkAuthCode(
  codesService: CodesService,
  checkCode: number,
  email: string,
): Promise<boolean> {
  const codes: AuthCodes[] = await codesService.getAllAuthCodes();

  for (const code of codes) {
    if (code.code === checkCode && code.email === email) {
      const expireTime: Date = addHours(new Date(code.createdAt), 1);
      const now: Date = new Date(Date.now());

      // Is the right code and role but it is expired
      if (expireTime.getTime() < now.getTime()) {
        return false;
      }

      // Success!
      return true;
    }
  }

  return false;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + hours * 60 * 60 * 1000);
  return result;
}
