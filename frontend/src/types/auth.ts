export type LoginPayload = { email: string; password: string; }; export type SignupPayload = LoginPayload & { name: string; };
