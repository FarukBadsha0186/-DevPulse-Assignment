export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginDTO {
  email: string;
  password: string;
}