import { Router, Request, Response, NextFunction } from "express";
import { validateData } from "../middleware/validator-middleware.js";
import {
    EmailService
} from "../services/email-service.js";
import { PassVerificationRequest, PassVerificationSchema, SendEmailCodeRequest, SendEmailCodeRequestSchema } from "../schemas/user-schema.js";

export function emailRouter(Service: EmailService) {
    return Router()
    .post(
        "/send",
        validateData(SendEmailCodeRequestSchema, "body"),
        async (
            req: Request<Record<string, never>, unknown, SendEmailCodeRequest>,
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
    .get(
        "/verify",
        validateData(PassVerificationSchema, "body"),
        async (
            req: Request<Record<string, never>, unknown, PassVerificationRequest>,
            res: Response,
            next: NextFunction,
        ) => {
            const verifyUserRequest = req.body;
            try {
                const result = await Service.passVerification(verifyUserRequest);
                res.status(200).json({ result: result});
            } catch (err) {
                next(err);
            }

        }
    );
}
