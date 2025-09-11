export interface Login {
  password: string;
  email: string;
};
export interface Registro extends Login {
  name: string;
  confirmPassword: string;
};