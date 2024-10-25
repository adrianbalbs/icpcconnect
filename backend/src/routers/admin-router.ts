import { Router, Request, Response, NextFunction } from "express";
import { AdminService } from "../services/index.js";
import { roleSwitchMiddleware } from "../middleware/role-direct-middleware.js";
import { CoachService } from "../services/index.js";
import { StudentService } from "../services/index.js";
import { SiteCoordinatorService } from "../services/index.js";
import { HTTPError, badRequest } from "../utils/errors.js";
import { CreateAdminRequest, CreateAdminRequestSchema } from "../schemas/user-schema.js";
import { validateData } from "../middleware/validator-middleware.js";
import { AlgorithmService } from "../services/algorithm-service.js";

export function adminRouter(
    adminService: AdminService,
    coachService: CoachService,
    studentService: StudentService,
    siteCoordinatorService: SiteCoordinatorService,
    algorithmService: AlgorithmService
) {
    return Router()
    .get(
        "/admin",
        async (_req: Request, res: Response, next: NextFunction) => {
            try {
                const users = await adminService.getAllMembers();
                res.status(200).json(users);
            } catch (err) {
                next(err);
            }
        },
    )
    .get(
        // Not expect to be used, but remain here just for cases
        "/admin/details",
        async (_req: Request, res: Response, next: NextFunction) => {
            try {
                const users = await adminService.getAllMembersInDetails();
                res.status(200).json(users);
            } catch (err) {
                next(err);
            }
        },
    )
    .get(
        "/admin/:id",
        async (
            req: Request<{ id: string }, unknown>,
            res: Response,
            next: NextFunction,
        ) => {
            const { id } = req.params;

            try {
                let result;

                // attempt to fetch from student service
                result = await studentService.getStudentById(id).catch(() => null);

                //if not found, attempt to fetch from coach service
                if (!result) {
                    result = await coachService.getCoachById(id).catch(() => null);
                }

                //if not found, attempt to fetch from site coordinator service
                if (!result) {
                    result = await siteCoordinatorService.getSiteCoordinatorById(id).catch(() => null);
                }

                if (!result) {
                    result = await adminService.getAdminById(id).catch(() => null);
                }

                if (!result) {
                    throw new HTTPError(badRequest);
                }

                //if result is found, send it in the response
                res.status(200).json(result);
                
            } catch (err) {
                next(err); // Handle unexpected errors
            }
            
        },
    )
    .get(
        "/admin/runalgo",
        async (_req: Request, res: Response, next: NextFunction) => {
            try {
                const success = await algorithmService.callAlgorithm();
                res.status(200).json(success);
            } catch (err) {
                next(err);
            }
        },
    )
    .put(
        "/admin/:id",
        roleSwitchMiddleware(adminService, coachService, studentService, siteCoordinatorService), // Use middleware for role switching
        () => {
        // The middleware handles the response, so no additional handle is required here
        }
    )
    .post(
        "/admin",
        validateData(CreateAdminRequestSchema, "body"),
        async (
            req: Request<Record<string, never>, unknown, CreateAdminRequest>,
            res: Response,
            next: NextFunction,
        ) => {
            const adminDetails = req.body;
            try {
                const result = await adminService.createAdmin(adminDetails);
                res.status(200).json(result);
            } catch (err) {
                next(err);
            }
        },
    )
    .delete(
        "/admin/:id",
        async (
            req: Request<{ id: string }, unknown>,
            res: Response,
            next: NextFunction,
        ) => {
            const { id } = req.params;
            try {
                const result = await adminService.deleteAdmin(id);
                res.status(200).json(result);
            } catch (err) {
                next(err);
            }
        },
    );
}
