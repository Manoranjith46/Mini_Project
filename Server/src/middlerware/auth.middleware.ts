import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CitizenModel } from "../models/citizen.model";

interface DecodedToken {
  id: string;
  phone?: string;
  role: "admin" | "citizen";
}

declare global {
  namespace Express {
    interface Request {
      citizenId?: string;
      citizenPhone?: string;
      adminId?: string;
      role?: "admin" | "citizen";
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];

  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    console.log("Invalid token or missing authorization header");
    res.status(401).json({
      message: "Authorization header is missing or malformed",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  // JWT_PASSWORD is expected to be set in the environment variables
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_PASSWORD!
    ) as DecodedToken;

    console.log("Decoded JWT:", decoded);
    //@ts-ignore
    if (decoded.role === "citizen") {
      req.citizenId = decoded.id;
      req.citizenPhone = decoded.phone;
      
      // If phone is not in JWT (old tokens), fetch from database
      if (!req.citizenPhone) {
        try {
          const citizen = await CitizenModel.findById(decoded.id);
          if (citizen) {
            req.citizenPhone = citizen.phonenumber;
            console.log("Fetched phone from DB:", req.citizenPhone);
          }
        } catch (err) {
          console.error("Error fetching citizen phone:", err);
        }
      }
    } else if (decoded.role === "admin") {
      req.adminId = decoded.id;
    }
    req.role = decoded.role;
    next();
  } catch (e) {
    console.error("Error verifying JWT:", e);
    res.status(403).json({
      message: "Invalid token or expired",
    });
  }
};
