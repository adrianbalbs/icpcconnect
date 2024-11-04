import { Request, Response, NextFunction } from "express";
import { CoachService } from "../services/coach-service.js";
import { StudentService } from "../services/student-service.js";
import { SiteCoordinatorService } from "../services/site-coordinator-service.js";
import { badRequest } from "../utils/errors.js";
import { AdminService } from "../services/admin-service.js";
export function roleSwitchMiddleware(
  adminService: AdminService,
  coachService: CoachService,
  studentService: StudentService,
  siteCoordinatorService: SiteCoordinatorService,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { role } = req.body;
    const { id } = req.params;

    const updatedDetails = req.body;

    try {
      let result;

      switch (role) {
        case "coach":
          result = await coachService.updateCoach(id, updatedDetails);
          break;
        case "student":
          result = await studentService.updateStudent(id, updatedDetails);
          break;
        case "site_coordinator":
          result = await siteCoordinatorService.updateSiteCoordinator(
            id,
            updatedDetails,
          );
          break;
        case "admin":
          result = await adminService.updateAdmin(id, updatedDetails);
          break;
        default: {
          const errorMessages = "Invalid Or No role specified";
          res.status(badRequest.errorCode).json({
            error: "Invalid data",
            details: errorMessages,
          });
          return;
        }
      }
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
