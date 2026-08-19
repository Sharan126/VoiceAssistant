import { Profile } from "./database.types";

export type UserProfile = Profile;

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
}
