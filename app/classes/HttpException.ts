import {ValidationError} from 'class-validator';
import {ValidationErrorItem} from 'sequelize';

import { messages } from '../middleware/common';
export class HttpException extends Error {
    status: number;
    message: string;
    type : "validation"|"sequelize"|"general";
    errors : any = null;
    constructor(status:number, type:"validation"|"sequelize"|"general", message:string, errors:any[] | null) {
      super(message);
      this.status = status;
      this.type = type;
      this.message = message;   //Default message
      this.errors = errors;     //Errors in case of validation for example
      console.log(this.errors);
      this.patchMessage();
    }

    private patchMessage() {
      if (this.errors) {
        if (this.errors[0]) {
          switch (this.type) {
            case "validation": 
              this.transformValidationMessage();
              break;
            case "sequelize":
              this.transformSequelizeMessage();  
            default:
              //Do nothing and keep message
          }
        }
      }
    }

    private transformValidationMessage() {
      let myError : ValidationError = this.errors[0];
      this.message = messages.validation(myError.property);
    }

    private transformSequelizeMessage() {
      let myError :ValidationErrorItem =  this.errors[0];
      if (myError.type == "Validation error") {
        this.message = messages.validationSequelize(myError.path);
      }
    }
}
   
//export default HttpException;