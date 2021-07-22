import { User } from "sf-fx-sdk-nodejs";

export class UserImpl implements User {
  readonly id: string;
  readonly username: string;
  readonly onBehalfOfUserId?: string;

  constructor(id: string, username: string, onBehalfOfUserId: string) {
    this.id = id;
    this.username = username;
    this.onBehalfOfUserId = onBehalfOfUserId;
  }
}
