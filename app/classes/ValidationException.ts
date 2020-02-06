import { messages } from '../middleware/common';

export interface IValidationMessage {
    type:string;
    class?:string;
    value?:string;
    field?:string;
}

export class ValidationException extends Error {
    status: number = 400;   //Allways return 400 error message for invalid params
    message: string;
    errors : any = null;
    constructor(error:any) {
        super();
        try {
            let msg : IValidationMessage = {type:"unknown"};
            let field : string;
            const myError = error.array()[0];
            const msgJson = JSON.parse(JSON.stringify(myError.msg));
            if (typeof msgJson == "string") {
                msg.type = msgJson;
                field = myError.param;
            } else {
                msg = <IValidationMessage>msgJson;
                if (msg.field)
                    field = msg.field;
                else field = myError.param;
            }
            this.message = messages.validationExists(msg.class)

            switch(<string>msg.type) {
                case "exists": {
                    this.message= messages.validationExists(field);
                    break;
                }
                case "minlength": {
                    this.message= messages.validationMinLength(field,msg.value);
                    break;
                }
                case "maxlength": {
                    this.message= messages.validationMaxLength(field,msg.value);
                    break;
                }                
                case "password": {
                    this.message = messages.validationPassword(field);
                    break;
                }
                case "checked": {
                    this.message = messages.validationChecked(field);
                    break;
                }
                case "dbmissing": { //Expects not found in db
                    let type :string = "";
                    switch (msg.class) {
                        case 'User': 
                           type = messages['User'];
                           break;
                        default:
                           type = 'Error';   

                    }
                    this.message = messages.validationDBMissing(type);
                    break;
                }
                case "dbexists": {
                    let type :string = "";
                    switch (msg.class) {
                        case 'User': 
                           type = messages['User'];
                           break;
                        default:
                           type = 'Error';   

                    }
                    this.message = messages.validationDBExists(type);
                    break;
                }
                default: {
                    this.message = messages.validation(field);
                }
            }
        } catch(error) {
            this.message = messages.validation("Unknown"); //Default message
        }

    }
}
   