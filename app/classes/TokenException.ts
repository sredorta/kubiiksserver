
export class TokenException extends Error {
    status: number = 401;
    message: string;
    type:string = "token";
    reason:string;
    errors : any = null;
    constructor(status:number, message:string, reason:string) {
      super(message);
      this.status = status;
      this.message = message;   //Default message
      this.reason= reason;
    }

}