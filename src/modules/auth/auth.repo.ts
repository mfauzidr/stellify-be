import { QueryResult } from "pg";
import db from "../../shared/config/pg";
import { IUser, IUserBody } from "../../modules/users/users.model";

export const getEmail = async (email: string): Promise<IUser> => {
  const query = `
    SELECT
      "id",
      "uuid",
      "email",
      "password",
      "role"
    FROM "users"
    WHERE "email" = $1`;
  const values: string[] = [email];
  const { rows }: QueryResult<IUser> = await db.query(query, values);
  return rows[0];
};

export const register = async (
  data: IUserBody,
  hashedPassword: string
): Promise<IUser[]> => {
  const query = `
        INSERT INTO "users"
        ("email", "password")
        VALUES
        ($1, $2)
        RETURNING "email", "uuid"
    `;

  const { email } = data;
  const values = [email, hashedPassword];
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};
