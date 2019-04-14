import {registerDecorator, ValidationArguments, ValidationOptions,ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import { User } from "../models/user";
import {Model} from "sequelize";

////////////////////////////////////////////////////////////////////////////
// PASSWORD VALIDATOR : IsPassword()
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
        if (!value.match(re))
            return false
        return true;
        //return text.length > validationArguments.constraints[0] && text.length < args.constraints[1];
    }
 
}

export function IsPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
         registerDecorator({
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [],
             validator: PasswordValidator
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

        console.log("Using class : " + MyClass.name);
        console.log(MyClass.name);
        const myPromise =  new Promise<boolean>((resolve,reject) => {
            MyClass.findOne({
                where: {
                    "email": value
                }
                }).then((result:any)=> {
                    if(result) resolve(false);
                    return resolve(true);
                }).catch((error: Error) => {
                    return resolve(true);
                });
        });
        return myPromise;

        //return text.length > validationArguments.constraints[0] && text.length < args.constraints[1];
    }
 
}

export function IsUnique<T extends Model>(myClass:new() => T,validationOptions?: ValidationOptions) {
    console.log("RHO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! : ");
    console.log(myClass.name);
    return function (object: Object, propertyName: string) {
        console.log("JERE")
         registerDecorator({
             target: object.constructor,
             propertyName: propertyName,
             options: validationOptions,
             constraints: [myClass],
             validator: UniqueValidator
         });
    };
}*/