import express from 'express';
import {Response,Request,NextFunction} from 'express';
//import sequelize = require('sequelize');
import {User} from '../models/user';
import {Model} from 'sequelize';
import {validate, ValidationError } from 'class-validator';
import AppConfig from '../config/config.json';

export class Helper {
    
    //Check if sharedSettings key matches a value
    public static isSharedSettingMatch(key:string, value:string) : boolean {
        let obj = AppConfig.sharedSettings.find(obj => obj.key == key);
        if (obj)
            if (obj.value == value) 
                return true;
        return false;
    }  

    //Get sharedSettings key if exists
    public static getSharedSetting(key:string) : string | undefined {
        let obj = AppConfig.sharedSettings.find(obj => obj.key == key);
        if (obj)
            return obj.value;
        else 
            return undefined;    
    }
    
    
    //Generate random string of the given length
    public static generateRandomString(length:number) : string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    //Generate random string with numbers of the given length
    public static generateRandomNumber(length:number) : string {
        var text = "";
        var possible = "0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    /*
    public static validate<T>(objects:T[]) : Promise<boolean> {

        console.log("Running Helper.validate");
        const myPromise =  new Promise<boolean>((resolve,reject) => {
            let message :string ="";
            let errors : ValidationError[]; 
            async function _validate() {
                let send : boolean = false;
                for (let obj of objects) {
                    console.log(obj);
                    errors = await validate(obj);
                    if (errors.length) {
                        for (let key in errors[0].constraints) {
                            message = errors[0].constraints[key];
                            break;
                        }
                        console.log("Returning promise message :" +message);
                        if (!send) {send = !send; reject(message); resolve(false)};
                    }
                }
                console.log("Returning promise message : <empty>" );
                if (!send) {send=!send; resolve(true);}
            }
            _validate();

        });
        return myPromise;
    }
    */
/*
    for (let obj of objects){
        let errors = await validate(obj);
        if (errors.length) {
            let message = "";
            for (let key in errors[0].constraints) {
                message = errors[0].constraints[key];
                break;
            }
            resolve(message);
        }*/
/*
    public static isUnique<T extends Model>(myClass: new()=>T) { //,value:any,modelName:string, field:string) {
        //return function(value:any, next:NextFunction) {
            console.log("Running custom IsUnique !!!!");
            console.log(myClass);
    }*/
}
