import express from 'express';
import {Response,Request,NextFunction} from 'express';
//import sequelize = require('sequelize');
import {User} from '../models/user';
import {Model} from 'sequelize';

export class Helper {

    public static isUnique<T extends Model>(myClass: new()=>T) { //,value:any,modelName:string, field:string) {
        //return function(value:any, next:NextFunction) {
            console.log("Running custom IsUnique !!!!");
            console.log(myClass);
            /*let query =  {};
            query[field] =value;
            User.findOne({where: query, attributes: ["id"]}).then(function(obj:any) {
                console.log(obj);
              /*if (obj) {
                next(field + ' "' + value + '" is already in use');
              } else {
                next();
              }
            });*/
          //};
    }
}
/*
Setting.findOne({
    where: {
        "key": key
    }
}).then((result)=> {
    res.json(result);
}).catch( (error) => {
    next(new HttpException(500, "sequelize", error.message, error.errors));
});*/