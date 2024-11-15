import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import { EmailService } from "../services/email-service.js";
import {
  EmailTeams,
  EmailTeamsScehma,
  ForgotPasswordResetPasswordRequest,
  ForgotPasswordResetPasswordSchema,
  PassForgotPasswordVerificationRequest,
  PassForgotPasswordVerificationSchema,
  PassRegisterEmailVerificationRequest,
  PassRegisterEmailVerificationSchema,
  SendEmailForgotPasswordCodeRequest,
  SendEmailForgotPasswordCodeRequestSchema,
  SendEmailVerificationCodeRequest,
  SendEmailVerificationCodeRequestSchema,
} from "../schemas/index.js";

export function emailRouter(Service: EmailService) {
  return Router()
    .post(
      "/registVerificationSend",
      validateData(SendEmailVerificationCodeRequestSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          SendEmailVerificationCodeRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const sendEmail = req.body;
        try {
          const result = await Service.sendEmailVerificationCode(sendEmail);
          res.status(200).json({ codes: result });
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/registVerificationVerify",
      validateData(PassRegisterEmailVerificationSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          PassRegisterEmailVerificationRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const verifyUserRequest = req.body;
        try {
          const result =
            await Service.passRegisterEmailVerification(verifyUserRequest);
          res.status(200).json({ result: result });
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/forgotPasswordSend",
      validateData(SendEmailForgotPasswordCodeRequestSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          SendEmailForgotPasswordCodeRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const sendEmail = req.body;
        try {
          const result = await Service.sendEmailForgotPasswordCode(sendEmail);
          res.status(200).json({ codes: result });
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/verifyForgotPassword",
      validateData(PassForgotPasswordVerificationSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          PassForgotPasswordVerificationRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const passVerification = req.body;
        try {
          const result =
            await Service.passForgotPasswordVerification(passVerification);
          res.status(200).json({ codes: result });
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/resetForgotPassword",
      validateData(ForgotPasswordResetPasswordSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          ForgotPasswordResetPasswordRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const resetPassword = req.body;
        try {
          const result =
            await Service.forgotPasswordChangePassword(resetPassword);
          res.status(200).json({ codes: result });
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/sendTeamCreatedEmail", // For front end: it should be called after you call the /runalgo route to create teams.
      validateData(EmailTeamsScehma, "body"),
      async (
        req: Request<Record<string, never>, unknown, EmailTeams>,
        res: Response,
        next: NextFunction,
      ) => {
        const { contestId } = req.body;
        try {
          await Service.sendTeamMemberInfo(contestId);
          res.status(200).json({});
        } catch (err) {
          next(err);
        }
      },
    );
}
