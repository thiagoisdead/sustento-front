export interface Login {
  password: string;
  email: string;
};
export interface Registro extends Login {
  name: string;
  confirmPassword: string;
};
export interface User {
  active_plan_id: string | null;
  activity_lvl: string | null;
  age: string | null;
  created_at: string;
  email: string;
  gender: string | null;
  height: string | null;
  name: string;
  objective: string | null;
  updated_at: string;
  user_id: string;
  weight: string | null;
  restrictions: string | null
}
export interface NavigationButton {
  Icon: any;
  name: string;
  path: string;
}
export interface Foods {
  title: string;
  kcal: number;
  carbs: number;
  protein: number;
  fats: number;
}