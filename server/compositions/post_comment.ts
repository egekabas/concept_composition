import { Filter, ObjectId } from "mongodb";
import { CommentConcept, CommentDoc } from "../concepts/comment";
import { PostConcept, PostDoc } from "../concepts/post";

export class Post_Comment<PostContent, CommentContent> implements PostConcept<PostContent>, CommentConcept<CommentContent> {
  public constructor(
    private readonly Post: PostConcept<PostContent>,
    private readonly Comment: CommentConcept<CommentContent>,
  ) {}
  async createComment(author: ObjectId, content: CommentContent, originalPost: ObjectId): Promise<ObjectId> {
    try {
      await this.Post.getPost(originalPost);
    } catch {
      throw new Error("Post does not exist!");
    }
    return await this.Comment.createComment(author, content, originalPost);
  }
  async deleteComment(_id: ObjectId): Promise<void> {
    await this.Comment.deleteComment(_id);
    await Promise.all((await this.Comment.getComments({ originalPost: _id })).map(async (comment) => await this.Comment.deleteComment(comment._id)));
  }
  getComments(query: Filter<CommentDoc<CommentContent>>): Promise<CommentDoc<CommentContent>[]> {
    return this.Comment.getComments(query);
  }
  getComment(_id: ObjectId): Promise<CommentDoc<CommentContent>> {
    return this.Comment.getComment(_id);
  }
  createPost(author: ObjectId, content: PostContent): Promise<ObjectId> {
    return this.Post.createPost(author, content);
  }
  async deletePost(_id: ObjectId): Promise<void> {
    await this.Post.deletePost(_id);
    await Promise.all((await this.Comment.getComments({ originalPost: _id })).map(async (comment) => await this.Comment.deleteComment(comment._id)));
  }
  getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]> {
    return this.Post.getPosts(query);
  }
  getPost(_id: ObjectId): Promise<PostDoc<PostContent>> {
    return this.Post.getPost(_id);
  }
}
