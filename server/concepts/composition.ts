import { Filter, ObjectId } from "mongodb";
import { InvitationConcept } from "./invitation";
import { PostConcept, PostDoc } from "./post";
import { RemovePassword, UserConcept, UserDoc } from "./user";

export interface UserAwarePostConcept<PostContent> {
  createPost(username: string, password: string, content: PostContent): Promise<ObjectId>;
  deletePost(username: string, password: string, _id: ObjectId): Promise<void>;
  getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]>;
  getPost(_id: ObjectId): Promise<PostDoc<PostContent>>;
}

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

// This might be a horrible way to this as the User Concept is passed to 2 sub concepts
export class UserInvite_Post<UserData extends { invitationKey: string }, PostContent> implements UserConcept<UserData>, InvitationConcept, UserAwarePostConcept<PostContent> {
  private readonly User_Invite: User_Invite<UserData>;
  private readonly Post: PostConcept<PostContent>;
  public constructor(UserConcept: UserConcept<UserData>, InvitationConcept: InvitationConcept, PostConcept: PostConcept<PostContent>) {
    this.User_Invite = new User_Invite(UserConcept, InvitationConcept);
    this.Post = PostConcept;
  }

  async createPost(username: string, password: string, content: PostContent): Promise<ObjectId> {
    if (!(await this.authenticateUser(username, password))) {
      throw new Error("Invalid credentials!");
    }
    const user = await this.User_Invite.getUser(username);
    return await this.Post.createPost(user._id, content);
  }
  async deletePost(username: string, password: string, _id: ObjectId): Promise<void> {
    if (!(await this.authenticateUser(username, password))) {
      throw new Error("Invalid credentials!");
    }
    const post = await this.Post.getPost(_id);
    const user = await this.User_Invite.getUser(username);
    if (post.author !== user._id) {
      throw new Error("You do not have permission to delete this post!");
    }
    await this.Post.deletePost(_id);
  }
  async getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]> {
    return this.Post.getPosts(query);
  }
  async getPost(_id: ObjectId): Promise<PostDoc<PostContent>> {
    return this.Post.getPost(_id);
  }

  createInvitation(): Promise<string> {
    return this.User_Invite.createInvitation();
  }
  checkInvitation(key: string): Promise<boolean> {
    return this.User_Invite.checkInvitation(key);
  }

  registerUser(username: string, password: string, data: UserData): Promise<ObjectId> {
    return this.User_Invite.registerUser(username, password, data);
  }
  authenticateUser(username: string, password: string): Promise<boolean> {
    return this.User_Invite.authenticateUser(username, password);
  }
  getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
    return this.User_Invite.getUsers(query);
  }
  getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
    return this.User_Invite.getUser(username);
  }
}

// export class User_Post<UserData, PostContent> implements UserConcept<UserData>, UserAwarePostConcept<PostContent> {
//   public constructor(
//     private readonly User: UserConcept<UserData>,
//     private readonly Post: PostConcept<PostContent>,
//   ) {}

//   getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
//     return this.User.getUser(username);
//   }
//   registerUser(username: string, password: string, data: UserData): Promise<ObjectId> {
//     return this.User.registerUser(username, password, data);
//   }
//   authenticateUser(username: string, password: string): Promise<boolean> {
//     return this.User.authenticateUser(username, password);
//   }
//   getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
//     return this.User.getUsers(query);
//   }

//   async createPost(username: string, password: string, content: PostContent): Promise<ObjectId> {
//     if (!(await this.authenticateUser(username, password))) {
//       throw new Error("Invalid credentials!");
//     }
//     const user = await this.User.getUser(username);
//     return await this.Post.createPost(user._id, content);
//   }
//   async deletePost(username: string, password: string, _id: ObjectId): Promise<void> {
//     if (!(await this.authenticateUser(username, password))) {
//       throw new Error("Invalid credentials!");
//     }
//     const post = await this.Post.getPost(_id);
//     const user = await this.User.getUser(username);
//     if (post.author !== user._id) {
//       throw new Error("You do not have permission to delete this post!");
//     }
//     await this.Post.deletePost(_id);
//   }
//   async getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]> {
//     return this.Post.getPosts(query);
//   }
//   async getPost(_id: ObjectId): Promise<PostDoc<PostContent>> {
//     return this.Post.getPost(_id);
//   }
// }
