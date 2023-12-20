import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";

export interface PostDoc<PostContent> extends BaseDoc {
  author: ObjectId;
  content: PostContent;
}
export interface PostConcept<PostContent> {
  createPost(author: ObjectId, content: PostContent): Promise<ObjectId>;
  deletePost(_id: ObjectId): Promise<void>;
  getPosts(query: Filter<PostDoc<PostContent>>): Promise<PostDoc<PostContent>[]>;
  getPost(_id: ObjectId): Promise<PostDoc<PostContent>>;
}

export class BasicPostConcept<PostContent> implements PostConcept<PostContent> {
  async getPost(_id: ObjectId): Promise<PostDoc<PostContent>> {
    const post = await this.posts.readOne({ _id });
    if (post == null) {
      throw new Error("Post not found!");
    }
    return post;
  }
  public readonly posts = new DocCollection<PostDoc<PostContent>>("posts");

  async createPost(author: ObjectId, content: PostContent) {
    const _id = await this.posts.createOne({ author, content });
    return _id;
  }

  async getPosts(query: Filter<PostDoc<PostContent>>) {
    const posts = await this.posts.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return posts;
  }
  async deletePost(_id: ObjectId) {
    if (!(await this.posts.readOne({ _id }))) {
      throw new Error("Post does not exist!");
    }
    await this.posts.deleteOne({ _id });
  }
}
