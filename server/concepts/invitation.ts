import DocCollection, { BaseDoc } from "../framework/doc";

export interface InvitationConcept {
  createInvitation(): Promise<string>;
  checkInvitation(key: string): Promise<boolean>;
}

interface InvitationDoc extends BaseDoc {
  key: string;
}

export class BasicInvitationConcept {
  public readonly invitations = new DocCollection<InvitationDoc>("invitations");
  async createInvitation(): Promise<string> {
    //eslint-disable-next-line no-constant-condition
    while (true) {
      const key = Math.random().toString();
      if (!(await this.invitations.readOne({ key }))) {
        await this.invitations.createOne({ key });
        return key;
      }
    }
  }
  async checkInvitation(key: string): Promise<boolean> {
    const invitation = await this.invitations.readOne({ key });
    return invitation ? true : false;
  }
}
