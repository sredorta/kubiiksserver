import {registerDecorator, ValidationArguments, ValidationOptions,ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import { User } from "../models/user";
import {Model} from "sequelize";
import {Validator} from "class-validator";

const validator = new Validator();
////////////////////////////////////////////////////////////////////////////
// PASSWORD VALIDATOR : IsPassword(params)
//  description: Validates password quality
////////////////////////////////////////////////////////////////////////////
@ValidatorConstraint()
class PasswordValidator implements ValidatorConstraintInterface {
 
    validate(value: string, args: ValidationArguments) {
        if (value ==undefined) return false;
        if (value == null) return false;
        if (value.length<5) return false;
        if (value.length>50) return false;
        //Do the validation
        //TODO improve this password validation check
        var re = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{5,}';
        //return false;
        if (!value.match(re))
            return false
        return true;
    }
 
}

export function IsPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
         registerDecorator({
             name: "IsPassword",
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [],
             validator: PasswordValidator
         });
    };
}

////////////////////////////////////////////////////////////////////////////
// PHONE VALIDATOR: IsPhone(locale,params)
//  description: Validates if string is land line phone
////////////////////////////////////////////////////////////////////////////
@ValidatorConstraint()
class PhoneValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const locale = args.constraints[0];
        //TODO : Do the corresponding checkings depending on locale
        //console.log("VALUE: " + value);
        //console.log("Using locale: " + locale);
        //console.log(value.length);
        if (value) {
            if (value.length!= 10) return false;
            let re = /^\d+$/;
            if(!re.test(value)) return false;
            re =/^0[1-5].*$/;
            if (!value.match(re))
            return false;
        }
        return true;   
    }
 
}

export function IsPhone(locale:string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
         registerDecorator({
             name: "IsPhone",
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [locale],
             validator: PhoneValidator
         });
    };
}

////////////////////////////////////////////////////////////////////////////
// MOBILE VALIDATOR: IsMobile(locale, params)
//  description: Validates if string is land line phone
////////////////////////////////////////////////////////////////////////////
@ValidatorConstraint()
class MobileValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const locale = args.constraints[0];
        console.log("Value is : "+ value);
        //TODO : Do the corresponding checkings depending on locale
        //console.log("VALUE: " + value);
        //console.log("Using locale: " + locale);
        //console.log(value.length);
        if (value) {        //Do the check if there is a value
            if (value.length!= 10) return false;
            let re = /^\d+$/;
            if(!re.test(value)) return false;
            re =/^0[6-7].*$/;
            if (!value.match(re))
            return false;
        }
        return true;   
    }
 
}

export function IsMobile(locale:string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
         registerDecorator({
             name: "IsMobile",
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [locale],
             validator: MobileValidator
         });
    };
}





/*
////////////////////////////////////////////////////////////////////////////
// UNIQUE VALIDATOR : IsUnique()
//  description: Validates is Unique in database
////////////////////////////////////////////////////////////////////////////

@ValidatorConstraint({name: "IsUnique", async:true})
class UniqueValidator implements ValidatorConstraintInterface {
 
    validate(value: string, args: ValidationArguments) {
        console.log("IS UNIQUE VALIDATOR : " + value);
        let MyClass = args.constraints[0];
        let field = args.constraints[1];
        console.log("Using class : " + MyClass.name);
        console.log("Using fields: " + field);
        console.log(MyClass);

        let query :any =  {};
        query[field] =value;
        const myPromise =  new Promise<boolean>((resolve,reject) => {
            MyClass.findOne({
                where: query
                }).then((result:any)=> {
                    console.log(result);
                    if(result) resolve(false);
                    return resolve(true);
                }).catch((error: Error) => {
                    return resolve(true);
                });
        });
        return myPromise;
    }
 
}

export function IsUnique<T extends Model>(myClass:new() => T,field:string,validationOptions?: ValidationOptions) {
    console.log(myClass.name);
    return function (object: Object, propertyName: string) {
         registerDecorator({
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [myClass, field],
             validator: UniqueValidator
         });
    };
}*/