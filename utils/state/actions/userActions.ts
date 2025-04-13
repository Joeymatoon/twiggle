import { HeaderCardProps } from "../links/links-card";
import { AddUserHeaderAction, AddUserLinkAction, UserActionTypes, UserState } from "@/utils/state/reducers/user-reducer";
import { createAction } from "@reduxjs/toolkit";
import { SocialLink } from "@/types/social-link";

// actions/userActions.ts
export const updateUserInfo = createAction<Partial<UserState>>("user/updateUserInfo");
export const updateSocialLinks = createAction<SocialLink[]>("user/updateSocialLinks");
export const addUserHeader = createAction<HeaderCardProps[]>("user/addUserHeader");
export const addUserLink = createAction<HeaderCardProps[]>("user/addUserLink");