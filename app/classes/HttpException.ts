import {ValidationError} from 'class-validator';
import {ValidationErrorItem} from 'sequelize';

import { messages } from '../middleware/common';
export class HttpException extends Error {
    status: number;
    message: string;
    errors : any = null;
    constructor(status:number, message:string, errors:any[] | null) {
      super(message);
      this.status = status;
      this.message = message;   //Default message
      this.errors = errors;     //Errors in case of validation for example
      
    }

}
   
//export default HttpException;