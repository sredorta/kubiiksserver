export class HttpException extends Error {
    status: number;
    type:string = "unknown";
    message: string;
    errors : any = null;
    constructor(status:number, type:string, message:string, errors:any | null) {
      super(message);
      this.status = status;
      this.type = type;         //Name of the Error
      this.message = message;   //Default message
      this.errors = errors;     //Errors in case of validation for example
      console.log("We end creating HttpException !");
      console.log(this);
    }
}
   
//export default HttpException;