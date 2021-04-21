import {
  SalesforceContextCloudEventExtension,
} from "../extensions";

export class User {
  readonly id: string;
  readonly username: string;
  readonly onBehalfOfUserId?: string;

  constructor(contextExt: SalesforceContextCloudEventExtension) {
    this.id = contextExt.userContext.userId;
    this.username = contextExt.userContext.username;
    this.onBehalfOfUserId = contextExt.userContext.onBehalfOfUserId;
  }
}
