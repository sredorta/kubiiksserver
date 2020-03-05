import {Response,Request,NextFunction} from 'express';
import validator from 'validator';
import CustomValidator from 'express-validator';
import { messages } from '../middleware/common';
import { Model } from 'sequelize';
import { IValidationMessage } from './ValidationException';
import { Helper } from './Helper';
import { resolve } from 'bluebird';
import { User } from '../models/user';
import {Op} from "sequelize";


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

    static passwordUpdate() {
        return (value:any, {req} : {req:Request}) => {
            //Password and passwordOld must exist and fullfill requirements !!!
            if (!Helper.passwordPassQualityRequired(req.body.password)) {
                return Promise.reject({type:'password'});
            }
            if (!Helper.passwordPassQualityRequired(req.body.passwordOld)) {
                return Promise.reject({type:'password'});
            }
            return Promise.resolve();
        }
    }

    
    /**Does firstName and lastName validation based on shared data validation*/
    static nameValidator() {
        return (value:any) => {
            //firstName checking
            if (value) {
                   if (!validator.isLength(value,{min:2})) return Promise.reject(<IValidationMessage>{type:'minlength',value:'2'});
                   if (!validator.isLength(value,{max:50})) return Promise.reject(<IValidationMessage>{type:'maxlength',value:'50'});                
            } 
            return Promise.resolve(); //End of validation success
        }
    }

    /**checks correct phone format and if is optional or not depending on shared*/
    static phone() {
        return (value:any, {req} : {req:Request}) => {
            if (value) {
                //TODO: Add locals handling here !!!!
                if (value.length!= 10) return Promise.reject({type:'phone'});
                let re = /^\d+$/;
                if(!re.test(value)) return Promise.reject({type:'phone'});
                re =/^0[1-5].*$/;
                if (!value.match(re)) return Promise.reject({type:'phone'});
            }
            //Correct
            return Promise.resolve();
         }
    }

    /**checks correct mobile format and if is optional or not depending on shared*/
    static mobile() {
        return (value:any, {req} : {req:Request}) => {
            if(value) {
                //TODO: Add locals handling here !!!!
                if (value.length!= 10) return Promise.reject({type:'mobile'});
                let re = /^\d+$/;
                if(!re.test(value)) return Promise.reject({type:'mobile'});
                re =/^0[1-5].*$/;
                if (value.match(re)) return Promise.reject({type:'mobile'});
            }
            //Correct
            return Promise.resolve();
         }
    }
    /**checks correct mobile format and if is optional or not depending on shared*/
    static avatar() {
        return (value:string, {req} : {req:Request}) => {
            if(value) {
                console.log("CHECKING AVATAR",value);
                if (!value.includes('https://')) return Promise.reject({type:'avatar'});
            }
            //Correct
            return Promise.resolve();
         }
    }

    /**Boolean that is true */
    static checked() {
        return (value:any) => {
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

    /**Does all database verifications to see if user is not already in the db*/
    static dBuserNotPresent(MyClass:any) {
        return (value:any, {req} : {req:Request}) => {
            let query : any[] = [];
            query.push({email:req.body.email});
            if (req.body.phone != undefined && req.body.phone != null)
                    query.push({phone:req.body.phone});
            if (req.body.phone != undefined && req.body.phone != null)
                    query.push({phone:req.body.phone});
            return MyClass.findOne({
                where: {[Op.or]: query}
                }).then((user:any) => {
                if (user) {
                    return Promise.reject(<IValidationMessage>{type:'dbmissing',class:MyClass.name});
                }
            });
        }
    }
    /**Does all database verifications to see if user is not already in the db*/
    static dBuserNotPresentExceptMe(MyClass:any) {
        return (value:any, {req} : {req:Request}) => {
            if(!req.user) return Promise.reject(<IValidationMessage>{type:'dbmissing',class:MyClass.name});
            let query : any[] = [];
            if (req.body.email != undefined && req.body.email!= null)
                query.push({email:req.body.email});
            if (req.body.phone != undefined && req.body.phone!= null)
                query.push({phone:req.body.phone});
            if (req.body.mobile != undefined && req.body.mobile!= null)
                query.push({mobile:req.body.mobile});
       
            return MyClass.findOne({
                where: [{id:{[Op.not]:req.user.id}},{[Op.or]: query}]
                }).then((user:any) => {
                if (user) {
                    return Promise.reject(<IValidationMessage>{type:'dbmissing',class:MyClass.name});
                }
            });
        }
    }

}