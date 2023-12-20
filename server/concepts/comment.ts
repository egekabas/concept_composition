import { Filter, ObjectId } from "mongodb";
import DocCollection from "../framework/doc";
import { PostDoc } from "./post";

export interface CommentDoc<Content> extends PostDoc<Content> {
  originalPost: ObjectId;
}

export interface CommentConcept<Content> {
  createComment(author: ObjectId, content: Content, originalPost: ObjectId): Promise<ObjectId>;
  deleteComment(_id: ObjectId): Promise<void>;
  getComments(query: Filter<CommentDoc<Content>>): Promise<CommentDoc<Content>[]>;
  getComment(_id: ObjectId): Promise<CommentDoc<Content>>;
}

export class BasicCommentConcept<Content> implements CommentConcept<Content> {
  public readonly comments = new DocCollection<CommentDoc<Content>>("posts");
  async createComment(author: ObjectId, content: Content, originalPost: ObjectId): Promise<ObjectId> {
    const _id = await this.comments.createOne({ author, content, originalPost });
    return _id;
  }
  async deleteComment(_id: ObjectId): Promise<void> {
    if (!(await this.comments.readOne({ _id }))) {
      throw new Error("Post does not exist!");
    }
    await this.comments.deleteOne({ _id });
  }
  async getComments(query: Filter<CommentDoc<Content>>): Promise<CommentDoc<Content>[]> {
    const comments = await this.comments.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return comments;
  }
  async getComment(_id: ObjectId): Promise<CommentDoc<Content>> {
    const comment = await this.comments.readOne({ _id });
    if (comment == null) {
      throw new Error("Comment not found!");
    }
    return comment;
  }
}
