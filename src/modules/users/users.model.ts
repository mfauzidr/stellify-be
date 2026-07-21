export interface IUserBody {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  provider: string;
  provider_id?: string;
  role: string;
}

export interface IUser extends IUserBody {
  id: number;
  uuid: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface IUserParams {
    uuid: string
    email?:string
}

export interface IUserQueryParams {
  search?: string;
  sortBy?: string;
  order?: string;
  page?: string;
  limit?: string;
}
