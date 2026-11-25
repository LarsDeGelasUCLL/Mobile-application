import type { StateCreator } from "zustand";
import type {
  ChangeEmailRequestDto,
  LoginRequestDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  ResendConfirmationRequestDto,
  SetPasswordRequestDto,
  UpdateUserProfileDto,
  User,
} from "../../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (payload: LoginRequestDto) => Promise<void>;
  register: (payload: RegisterRequestDto) => Promise<void>;
  /** Signs in with an auth email link's code; throws when it fails. */
  exchangeCodeForSession: (code: string) => Promise<void>;
  requestPasswordReset: (payload: PasswordResetRequestDto) => Promise<void>;
  setPassword: (payload: SetPasswordRequestDto) => Promise<void>;
  changeEmail: (payload: ChangeEmailRequestDto) => Promise<void>;
  resendConfirmation: (payload: ResendConfirmationRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateUserProfileDto) => Promise<void>;
}

export type AuthActionCreator = StateCreator<
  AuthState,
  [],
  [],
  Omit<AuthState, "user" | "isAuthenticated" | "isLoading" | "isInitialized">
>;
