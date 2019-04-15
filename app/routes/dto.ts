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
            return messages.validationEmpty("firstName");
        }
    })
    @MinLength(2, {
        message: function (){
            return messages.validationMinLength("firstName","2")
        }
    })
    @MaxLength(50, {
        message: function() {
            return messages.validationMaxLength("firstName","50")
        }
    })
    public firstName!: string;
}

export class DTOLastName {
    @IsString()
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("lastName");
        }
    })
    @MinLength(2, {
        message: function (){
            return messages.validationMinLength("lastName","2")
        }
    })
    @MaxLength(50, {
        message: function() {
            return messages.validationMaxLength("lastName","50")
        }
    })
    public lastName!: string;
}

export class DTOEmail {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("email");
        }
    })
    @IsEmail({}, {
        message: function() {
            return messages.validation("email");
        }
    })
    public email!: string;
}

export class DTOPassword {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("password");
        }
    })
    @IsPassword({
        message:function() {
            return messages.validationPassword("password");
        }
    })
    public password!: string;
}

export class DTOPhone {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("phone");
        }
    })
    @IsPhone("fr",{
        message:function() {
            return messages.validation("phone");
        }
    })
    public phone!: string;
}

export class DTOMobile {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("mobile");
        }
    })
    @IsMobile("fr",{
        message:function() {
            return messages.validation("mobile");
        }
    })
    public mobile!: string;
}
