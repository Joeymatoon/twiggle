import { HeaderCardProps } from "@/components/application/links/links-card";
import { Reducer } from "redux";
import { SocialLink } from "@/types/social-link";

export interface UserState {
  username: string;
  profilePic: string;
  bio: string;
  profileTitle: string;
  header: HeaderCardProps[];
  socialLinks: HeaderCardProps[];
}

// Define action types
export enum UserActionTypes {
  UPDATE_USER_INFO = "UPDATE_USER_INFO",
  UPDATE_SOCIAL_LINKS = "UPDATE_SOCIAL_LINKS",
  ADD_USER_HEADER = "ADD_USER_HEADER",
  ADD_USER_LINK = "ADD_USER_LINK"
}

// Define the initial state
const initialState: UserState = {
  username: "",
  profilePic: "",
  bio: "",
  profileTitle: "",
  header: [],
  socialLinks: []
};

// Define the user reducer
const userReducer: Reducer<UserState, any> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.UPDATE_USER_INFO:
      return {
        ...state,
        ...action.payload
      };
    case UserActionTypes.UPDATE_SOCIAL_LINKS:
      return {
        ...state,
        socialLinks: action.payload
      };
    case UserActionTypes.ADD_USER_HEADER:
      return {
        ...state,
        header: action.payload
      };
    case UserActionTypes.ADD_USER_LINK:
      return {
        ...state,
        header: action.payload
      };
    default:
      return state;
  }
};

export default userReducer;

// Action interfaces
export interface UpdateUserInfoAction {
  type: UserActionTypes.UPDATE_USER_INFO;
  payload: Partial<UserState>;
}

export interface UpdateSocialLinksAction {
  type: UserActionTypes.UPDATE_SOCIAL_LINKS;
  payload: SocialLink[];
}

export interface AddUserHeaderAction {
  type: UserActionTypes.ADD_USER_HEADER;
  payload: HeaderCardProps[];
}

export interface AddUserLinkAction {
  type: UserActionTypes.ADD_USER_LINK;
  payload: HeaderCardProps[];
}

export type UserAction =
  | UpdateUserInfoAction
  | UpdateSocialLinksAction
  | AddUserHeaderAction
  | AddUserLinkAction;
