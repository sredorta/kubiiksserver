import {messages} from '../middleware/common';
import {Helper} from '../classes/Helper';
import { IsNumber, IsEmail,IsString, MinLength, MaxLength, ValidateIf, validate,ValidatorConstraint } from 'class-validator';
import {IsPassword} from '../classes/ParameterValidationDecorators';

//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
//Each controller can have it's own classes if they are specific to the Controller

export class DTOFirstName {
    @ValidateIf(o=> Helper.isValidationCheckRequired("signup_firstName", "include"))
    @IsString()
    @MinLength(2, {
        message: function (){
            return messages.validationMinLength(messages.firstName,"2")
        }
    })
    @MaxLength(50, {
        message: function() {
            return messages.validationMaxLength(messages.firstName,"50")
        }
    })
    public firstName!: string;
}

export class DTOLastName {
    @ValidateIf(o=> Helper.isValidationCheckRequired("signup_lastName", "include"))
    @IsString()
    @MinLength(2, {
        message: function (){
            return messages.validationMinLength(messages.lastName,"2")
        }
    })
    @MaxLength(50, {
        message: function() {
            return messages.validationMaxLength(messages.lastName,"50")
        }
    })
    public lastName!: string;
}

export class DTOEmail {
    @ValidateIf(o=> Helper.isValidationCheckRequired("signup_email", "include"))
    @IsEmail({}, {
        message: function() {
            return messages.validation(messages.email);
        }
    })
    public email!: string;
}

export class DTOPassword {
    @IsPassword({
        message:function() {
            return messages.validationPassword(messages.password);
        }
    })
    public password!: string;
}
