import { Filter, ObjectId } from "mongodb";
import { CommentDoc } from "../concepts/comment";
import { InvitationConcept } from "../concepts/invitation";
import { PostDoc } from "../concepts/post";
import { RemovePassword, UserConcept, UserDoc } from "../concepts/user";
import { Post_Comment } from "./post_comment";
import { User_Invite } from "./user_invite";

export interface UserAwarePostConcept<PostContent> {
  createPost(username: string, password: string, content: PostContent): Promise<ObjectId>;
  deletePost(username: string, password: string, _id: ObjectId): Promise<void>;
  getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]>;
  getPost(_id: ObjectId): Promise<PostDoc<PostContent>>;
}
export interface UserAwareCommentConcept<CommentContent> {
  createComment(username: string, password: string, content: CommentContent, originalPost: ObjectId): Promise<ObjectId>;
  deleteComment(username: string, password: string, _id: ObjectId): Promise<void>;
  getComments(query: Filter<CommentDoc<CommentContent>>): Promise<CommentDoc<CommentContent>[]>;
  getComment(_id: ObjectId): Promise<CommentDoc<CommentContent>>;
}

export class UserInvite_PostComment<UserData extends { invitationKey: string }, PostContent, CommentContent>
  implements UserConcept<UserData>, InvitationConcept, UserAwarePostConcept<PostContent>, UserAwareCommentConcept<CommentContent>
{
  public constructor(
    private readonly UserInvite: User_Invite<UserData>,
    private readonly PostComment: Post_Comment<PostContent, CommentContent>,
  ) {}

  async createComment(username: string, password: string, content: CommentContent, originalPost: ObjectId): Promise<ObjectId> {
    const user = await this.UserInvite.getUser(username);
    return await this.PostComment.createComment(user._id, content, originalPost);
  }
  async deleteComment(username: string, password: string, _id: ObjectId): Promise<void> {
    if (!(await this.authenticateUser(username, password))) {
      throw new Error("Invalid credentials!");
    }
    const comment = await this.PostComment.getComment(_id);
    const user = await this.UserInvite.getUser(username);
    if (comment.author !== user._id) {
      throw new Error("You do not have permission to delete this post!");
    }
    await this.PostComment.deleteComment(_id);
  }
  getComments(query: Filter<CommentDoc<CommentContent>>): Promise<CommentDoc<CommentContent>[]> {
    return this.PostComment.getComments(query);
  }
  getComment(_id: ObjectId): Promise<CommentDoc<CommentContent>> {
    return this.PostComment.getComment(_id);
  }

  async createPost(username: string, password: string, content: PostContent): Promise<ObjectId> {
    const user = await this.UserInvite.getUser(username);
    return await this.PostComment.createPost(user._id, content);
  }
  async deletePost(username: string, password: string, _id: ObjectId): Promise<void> {
    if (!(await this.authenticateUser(username, password))) {
      throw new Error("Invalid credentials!");
    }
    const post = await this.PostComment.getPost(_id);
    const user = await this.UserInvite.getUser(username);
    if (post.author !== user._id) {
      throw new Error("You do not have permission to delete this post!");
    }
    await this.PostComment.deletePost(_id);
  }
  async getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]> {
    return this.PostComment.getPosts(query);
  }
  async getPost(_id: ObjectId): Promise<PostDoc<PostContent>> {
    return this.PostComment.getPost(_id);
  }

  createInvitation(): Promise<string> {
    return this.UserInvite.createInvitation();
  }
  checkInvitation(key: string): Promise<boolean> {
    return this.UserInvite.checkInvitation(key);
  }

  registerUser(username: string, password: string, data: UserData): Promise<ObjectId> {
    return this.UserInvite.registerUser(username, password, data);
  }
  authenticateUser(username: string, password: string): Promise<boolean> {
    return this.UserInvite.authenticateUser(username, password);
  }
  getUsers(query: Filter<RemovePassword<UserDoc<UserData>>>): Promise<RemovePassword<UserDoc<UserData>>[]> {
    return this.UserInvite.getUsers(query);
  }
  getUser(username: string): Promise<RemovePassword<UserDoc<UserData>>> {
    return this.UserInvite.getUser(username);
  }
}
