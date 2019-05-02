import {Response,Request,NextFunction} from 'express';
import validator from 'validator';
import CustomValidator from 'express-validator';
import { messages } from '../middleware/common';
import { Model } from 'sequelize';
import { IValidationMessage } from './ValidationException';
import { Helper } from './Helper';
export class CustomValidators extends Error {

    //When we reject the promise we send a msg that will be then intercepted by the ValidationException
    //Rejection format:
    //  string: Provide the type of the error
    //  obj : {type:"<type>",...} ->Other parameters will be handled by ValidationException

    /**Requires correct password format */
    static password() {
        return (value:any) => {
            if (!Helper.passwordPassQualityRequired(value)) {
                return Promise.reject({type:'password'});
            }
            return Promise.resolve();
        }
    }

    /**checks correct phone format and if is optional or not depending on shared*/
    static phone(field:string) {
        return (value:any, {req} : {req:Request}) => {
            console.log("Validating phone !!!!");
            if (!value) {
                if (Helper.isSharedSettingMatch(field, "include")) 
                    return Promise.reject({type:'exists'});
            } else {
                //TODO: Add locals handling here !!!!
                if (value.length!= 10) return Promise.reject({type:'phone'});
                let re = /^\d+$/;
                if(!re.test(value)) return Promise.reject({type:'phone'});
                re =/^0[1-5].*$/;
                if (!value.match(re)) return Promise.reject({type:'phone'});
            }
                //Correct phone
                return Promise.resolve();
         }
    }

    /**checks correct mobile format and if is optional or not depending on shared*/
    static mobile(field:string) {
        return (value:any, {req} : {req:Request}) => {
            console.log("Validating mobile !!!!");
            console.log(value);
            if (!value) {
                if (Helper.isSharedSettingMatch(field, "include")) 
                    return Promise.reject({type:'exists'});
            } else {
                //TODO: Add locals handling here !!!!
                if (value.length!= 10) return Promise.reject({type:'mobile'});
                let re = /^\d+$/;
                if(!re.test(value)) return Promise.reject({type:'mobile'});
                re =/^0[1-5].*$/;
                if (value.match(re)) return Promise.reject({type:'mobile'});
            }
                //Correct phone
                return Promise.resolve();
         }
    }


    /**Boolean that is true */
    static checked() {
        return (value:any) => {
            console.log("Validating checked !!!!");
            console.log(value);
            if (!validator.isBoolean(String(value))) return Promise.reject();
            if (value !== true) {
                return Promise.reject({type:'checked'});
            }
            //Correct
            return Promise.resolve();
         }
    }



    /**Expects that there is no element in the db with the specified field and class*/
    static dBMissing(MyClass: any, field:string) {
        return (value:any, {req} : {req:Request}) => {
            /*if (Helper.isSharedSettingMatch("email", "include")) {
                console.log("IS EMAIL :" + validator.isEmail("sergi.redorta@hotmail.com"));
            }*/
            let query : any = {};
            query[field]=value;
            return MyClass.findOne({where:query}).then((user:any) => {
                if (user) {
                    return Promise.reject(<IValidationMessage>{type:'dbmissing',class:MyClass.name});
                }
            });
        }
    }

   /**Expects that there is an element in the db with the specified field and class*/
   static dBExists(MyClass: any, field:string) {
        return (value:any, {req} : {req:Request}) => {
            let query : any = {};
            query[field]=value;
            return MyClass.findOne({where:query}).then((user:any) => {
                if (!user) {
                    return Promise.reject(<IValidationMessage>{type:'dbexists',class:MyClass.name});
                }
            });
        }
    }
    /**Does all signup validation*/
    static signup(MyClass: any, field:string) {
        return (value:any, {req} : {req:Request}) => {
            console.log("firstName : "  + req.body.firstName);
            console.log("lastName : "  + req.body.lastName);

            //firstName checking
            if (req.body.firstName!=undefined) {
                   if (!validator.isLength(req.body.firstName,{min:2})) return Promise.reject(<IValidationMessage>{type:'minlength',value:'2',field:"firstName"});
                   if (!validator.isLength(req.body.firstName,{max:50})) return Promise.reject(<IValidationMessage>{type:'maxlength',value:'50',field:"firstName"});                
            } else {   
                if (Helper.isSharedSettingMatch("firstName", "include")) 
                    return Promise.reject(<IValidationMessage>{type:'exists',field:"firstName"});
            }
            return Promise.resolve(); //End of validation success
        }
    }

    /**Does firstName and lastName validation based on shared data validation*/
    static nameValidator(field:string) {
        return (value:any) => {
            console.log("Value is: "  + value);
            //firstName checking
            if (value!=undefined) {
                   if (!validator.isLength(value,{min:2})) return Promise.reject(<IValidationMessage>{type:'minlength',value:'2'});
                   if (!validator.isLength(value,{max:50})) return Promise.reject(<IValidationMessage>{type:'maxlength',value:'50'});                
            } else {   
                if (Helper.isSharedSettingMatch(field, "include")) 
                    return Promise.reject(<IValidationMessage>{type:'exists'});
            }
            return Promise.resolve(); //End of validation success
        }
    }

}