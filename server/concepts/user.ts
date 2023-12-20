import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError } from "./errors";

export interface UserDoc<UserData> extends BaseDoc {
  username: string;
  password: string;
  data: UserData;
}
export type RemovePassword<UserData> = Omit<UserData, "password">;
function removePassword<UserData>(user: UserDoc<UserData>): RemovePassword<UserDoc<UserData>> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

export interface UserConcept<UserData> {
  registerUser(username: string, password: string, data: UserData): Promise<ObjectId>;
  authenticateUser(username: string, password: string): Promise<boolean>;
  getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]>;
  getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>>;
}

export class BasicUserConcept<UserData> implements UserConcept<UserData> {
  public readonly users = new DocCollection<UserDoc<UserData>>("basic-users");
  async getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
    const user = await this.users.readOne({ username });
    if (user === null) {
      throw new Error("User not found!");
    }
    return removePassword(user);
  }
  async getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
    return (await this.users.readMany(query)).map((user) => {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }
  async registerUser(username: string, password: string, data: UserData) {
    await this.canCreate(username, password);
    return await this.users.createOne({ username, password, data });
  }
  async authenticateUser(username: string, password: string) {
    const user = await this.users.readOne({ username, password });
    return user ? true : false;
  }
  async canCreate(username: string, password: string) {
    if (!username || !password) {
      throw new BadValuesError("Username and password must be provided!");
    }
    if (await this.users.readOne({ username })) {
      throw new Error("Username already exists!");
    }
  }
}

// We could implement any variation of the user concept
export class PrivateUserConcept<UserData> implements UserConcept<UserData> {
  public readonly users = new DocCollection<UserDoc<UserData>>("private-users");
  async getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
    const user = await this.users.readOne({ username });
    if (user === null) {
      throw new Error("User not found!");
    }
    return removePassword(user);
  }
  async registerUser(username: string, password: string, data: UserData): Promise<ObjectId> {
    await this.canCreate(username, password);
    return await this.users.createOne({ username, password, data });
  }
  async authenticateUser(username: string, password: string): Promise<boolean> {
    const user = await this.users.readOne({ username, password });
    return user ? true : false;
  }
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
    return []; // We will always prevent
  }
  async canCreate(username: string, password: string) {
    if (!username || !password) {
      throw new BadValuesError("Username and password must be provided!");
    }
    if (await this.users.readOne({ username })) {
      throw new Error("Username already exists!");
    }
  }
}
