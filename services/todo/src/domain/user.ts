export class User {
  private username: string;
  private fullname: string;
  private email: string;

  constructor(username: string, fullname: string, email: string) {
    this.username = username;
    this.fullname = fullname;
    this.email = email;
  }

  toDTO() {
    return {
      username: this.username,
      fullname: this.fullname,
      email: this.email,
    };
  }
}
