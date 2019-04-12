class HttpException extends Error {
    status: number;
    name:string = "unknown";
    message: string;
    errors : any = null;
    constructor(name:string, message:string, errors:any | null) {
      super(message);
      this.status = 200;
      this.name = name;         //Name of the Error
      this.message = message;   //Default message
      this.errors = errors;     //Errors in case of validation for example

    }
}
   
export default HttpException;