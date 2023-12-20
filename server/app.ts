import { UserInvite_Post, User_Invite } from "./concepts/composition";
import { BasicInvitationConcept } from "./concepts/invitation";
import { BasicPostConcept } from "./concepts/post";
import { BasicUserConcept } from "./concepts/user";

const User = new BasicUserConcept<{ legalName: string; invitationKey: string }>();
const Post = new BasicPostConcept<{ title: string; points: number }>();
const Invitation = new BasicInvitationConcept();

const UserInvite = new User_Invite(User, Invitation);
const UserInvitePost = new UserInvite_Post(User, Invitation, Post);

export default UserInvitePost;
