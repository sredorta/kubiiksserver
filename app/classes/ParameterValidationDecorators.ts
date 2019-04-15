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