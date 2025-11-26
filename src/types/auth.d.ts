import "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    slack_id?: string;
  }

  interface Session {
    accessToken?: string;
  }
}
