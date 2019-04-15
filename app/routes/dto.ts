import {messages} from '../middleware/common';
import {Helper} from '../classes/Helper';
import { IsNotEmpty,IsNumber, IsEmail,IsString, MinLength, MaxLength, ValidateIf, validate,ValidatorConstraint } from 'class-validator';
import {IsPassword, IsPhone, IsMobile} from '../classes/ParameterValidationDecorators';

//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
//Each controller can have it's own classes if they are specific to the Controller

export class DTOFirstName {
    //@ValidateIf(o=> Helper.isValidationCheckRequired("signup_firstName", "include"))
    @IsString()
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.firstName);
        }
    })
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
    @IsString()
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.lastName);
        }
    })
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
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.email);
        }
    })
    @IsEmail({}, {
        message: function() {
            return messages.validation(messages.email);
        }
    })
    public email!: string;
}

export class DTOPassword {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.password);
        }
    })
    @IsPassword({
        message:function() {
            return messages.validationPassword(messages.password);
        }
    })
    public password!: string;
}

export class DTOPhone {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.phone);
        }
    })
    @IsPhone("fr",{
        message:function() {
            return messages.validation(messages.phone);
        }
    })
    public phone!: string;
}

export class DTOMobile {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty(messages.mobile);
        }
    })
    @IsMobile("fr",{
        message:function() {
            return messages.validation(messages.mobile);
        }
    })
    public mobile!: string;
}
