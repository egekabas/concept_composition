import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface CommentDoc<CommentContent> extends BaseDoc {
  author: ObjectId;
  content: CommentContent;
  originalPost: ObjectId;
}

export interface CommentConcept<CommentContent> {
  createComment(author: ObjectId, content: CommentContent, originalPost: ObjectId): Promise<ObjectId>;
  deleteComment(_id: ObjectId): Promise<void>;
  getComments(query: Filter<CommentDoc<CommentContent>>): Promise<CommentDoc<CommentContent>[]>;
  getComment(_id: ObjectId): Promise<CommentDoc<CommentContent>>;
}

export class BasicCommentConcept<CommentContent> implements CommentConcept<CommentContent> {
  public readonly comments = new DocCollection<CommentDoc<CommentContent>>("posts");
  async createComment(author: ObjectId, content: CommentContent, originalPost: ObjectId): Promise<ObjectId> {
    const _id = await this.comments.createOne({ author, content, originalPost });
    return _id;
  }
  async deleteComment(_id: ObjectId): Promise<void> {
    if (!(await this.comments.readOne({ _id }))) {
      throw new Error("Post does not exist!");
    }
    await this.comments.deleteOne({ _id });
  }
  async getComments(query: Filter<CommentDoc<CommentContent>>): Promise<CommentDoc<CommentContent>[]> {
    const comments = await this.comments.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return comments;
  }
  async getComment(_id: ObjectId): Promise<CommentDoc<CommentContent>> {
    const comment = await this.comments.readOne({ _id });
    if (comment == null) {
      throw new Error("Comment not found!");
    }
    return comment;
  }
}
