import "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    accessToken?: string;
  }
}