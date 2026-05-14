import { ILocation } from "./location";
import { Types } from "mongoose";

export interface IIssue {
  citizenId: Types.ObjectId; // reference to Citizen
  issueType:
    | "Road Infrastructure"
    | "Waste Management"
    | "Environmental Issues"
    | "Utilities & Infrastructure"
    | "Public Safety"
    | "Other";
  title: string;
  description: string;
  status?: "In Progress" | "Resolved" | "Rejected" | "Pending" | "Reported";
  location: ILocation; // embedded location object
  media?: Types.ObjectId[]; // refs to multimedia
  upvotes?: number;
  upvotedBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  handledBy?: Object | string; 
}
