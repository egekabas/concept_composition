import { Filter, ObjectId } from "mongodb";
import { InvitationConcept } from "../concepts/invitation";
import { RemovePassword, UserConcept, UserDoc } from "../concepts/user";
export class User_Invite<UserData extends { invitationKey: string }> implements UserConcept<UserData>, InvitationConcept {
  public constructor(
    private readonly User: UserConcept<UserData>,
    public readonly Invitation: InvitationConcept,
  ) {}

  createInvitation(): Promise<string> {
    return this.Invitation.createInvitation();
  }
  checkInvitation(key: string): Promise<boolean> {
    return this.Invitation.checkInvitation(key);
  }
  async registerUser(username: string, password: string, data: UserData): Promise<ObjectId> {
    const invitationKey = data.invitationKey;
    if ((await this.checkInvitation(invitationKey)) === false) {
      throw new Error("Invalid invitation key!");
    }
    return this.User.registerUser(username, password, data);
  }
  authenticateUser(username: string, password: string): Promise<boolean> {
    return this.User.authenticateUser(username, password);
  }
  async getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
    return (await this.User.getUsers(query)).map((user) => {
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      user.data.invitationKey = ""; //invitationKey is private
      return user;
    });
  }
  async getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
    const user = await this.User.getUser(username);
    user.data.invitationKey = ""; //invitationKey is private
    return user;
  }
}
