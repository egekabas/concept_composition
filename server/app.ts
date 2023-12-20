import { Post_Comment } from "./compositions/post_comment";
import { User_Invite } from "./compositions/user_invite";
import { UserInvite_PostComment } from "./compositions/userinvite_postcomment";
import { BasicCommentConcept } from "./concepts/comment";
import { BasicInvitationConcept } from "./concepts/invitation";
import { BasicPostConcept } from "./concepts/post";
import { BasicUserConcept } from "./concepts/user";

const User = new BasicUserConcept<{ legalName: string; invitationKey: string }>();
const Post = new BasicPostConcept<{ title: string; points: number }>();
const Invitation = new BasicInvitationConcept();
const Comment = new BasicCommentConcept<{ text: string }>();

const UserInvite = new User_Invite(User, Invitation);
const PostComment = new Post_Comment(Post, Comment);
const UserInvitePostComment = new UserInvite_PostComment(UserInvite, PostComment);

export default UserInvitePostComment;
