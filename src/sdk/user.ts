import {
  SalesforceContextCloudEventExtension,
} from "../extensions";

export function createUser(
  contextExt: SalesforceContextCloudEventExtension
): User {
    let user = new User(contextExt);
    return user;
}

export class User {
  id: string;
  username: string;
  onBehalfOfUserId?: string;

  constructor(contextExt: SalesforceContextCloudEventExtension) {
    this.id = contextExt.userContext.userId;
    this.username = contextExt.userContext.username;
    this.onBehalfOfUserId = contextExt.userContext.onBehalfOfUserId;
  }
}
