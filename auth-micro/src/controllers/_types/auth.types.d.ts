type ErrorResponse = { error: string };
interface LoginResponse {
  message: string;
  token: string;
}

interface RegisterResponse extends LoginResponse {
  user: {
    id: string | number;
    name: string;
    email: string;
  };
}

interface ILoginRequest {
  email: string;
  password: string;
}

interface IRegisterRequest extends ILoginRequest {
  name: string;
}

export type {
  ILoginRequest,
  IRegisterRequest,
  LoginResponse,
  ErrorResponse,
  RegisterResponse,
};
