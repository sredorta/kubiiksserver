import express from 'express';
import {Response,Request,NextFunction} from 'express';
//import sequelize = require('sequelize');
import {User} from '../models/user';
import {Model} from 'sequelize';
import {validate, ValidationError } from 'class-validator';
import {AppConfig} from '../utils/Config';

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
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    //Generate random string with numbers of the given length
    public static generateRandomNumber(length:number) : string {
        let text = "";
        const possible = "0123456789";

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    //Returns if the password passes the quality required (Used in DTO and in generate password)
    public static passwordPassQualityRequired(value:string) {
        //TODO improve this password validation check
        if (value ==undefined) return false;
        if (value == null) return false;
        if (value.length<5) return false;
        if (value.length>50) return false;
        var re = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{5,}';

        //return false;
        if (!value.match(re))
            return false
        return true; 
    }

    public static generatePassword() : string {
        let password = Helper.generateRandomString(10);
        let i = 0;
        while(!Helper.passwordPassQualityRequired(password)) {
            password = Helper.generateRandomString(10);
            console.log("Password generation iteration : " + i);
            i++;
        }
        return password;
    }

    //Get array of only one field from an array of objects
    public static pluck<T, K extends keyof T>(objs: T[], key: K): T[K][] {
        return objs.map(obj => obj[key]);
    }

}
