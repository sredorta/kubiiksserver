import {messages} from '../middleware/common';
import {Helper} from '../classes/Helper';
import {IsBoolean, IsNotEmpty,IsOptional, IsEmail,IsString, MinLength, MaxLength, ValidateIf, validate,ValidatorConstraint } from 'class-validator';
import {IsPassword, IsPhone, IsMobile, IsUnique} from '../classes/ParameterValidationDecorators';
import { User } from '../models/user';

//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
//Each controller can have it's own classes if they are specific to the Controller

export class DTOId {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("id");
        }
    })
    public id!:number;
}

export class DTOFirstNameRequired {
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
export class DTOFirstNameOptional {
    @IsString()
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



export class DTOLastNameRequired {
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

export class DTOLastNameOptional {
    @IsString()
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

export class DTOPhoneRequired {
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
    @IsUnique(User,"phone",{
        message:function() {
            return messages.validationUnique(messages.User);
        }
    })
    public phone!: string;
}
export class DTOPhoneOptional {
    @ValidateIf(o=>o.phone != "")
    @IsPhone("fr",{
        message:function() {
            return messages.validation("phone");
        }
    })
    @IsUnique(User,"phone",{
        message:function() {
            return messages.validationUnique(messages.User);
        }
    })
    public phone!: string;
}

export class DTOMobileRequired {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("mobile");
        }
    })
    @IsMobile("fr", {
        message:function() {
            return messages.validation("mobile");
        }
    })
    @IsUnique(User,"mobile",{
        message:function() {
            return messages.validationUnique(messages.User);
        }
    })
    public mobile!: string;
}

export class DTOMobileOptional {
    @ValidateIf(o=>o.mobile != "")
    @IsMobile("fr", {
        message:function() {
            return messages.validation("mobile");
        }
    })
    @IsUnique(User,"mobile",{
        message:function() {
            return messages.validationUnique(messages.User);
        }
    })
    public mobile!: string;
}

export class DTOTerms {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("terms");
        }
    })
    @IsBoolean({
        message:function() {
            return messages.validation("terms");
        }
    })
    public terms!: boolean;
}
export class DTOKeepConnected {
    @IsBoolean({
        message:function() {
            return messages.validation("keepconnected");
        }
    })
    public keepconnected!: boolean;
}