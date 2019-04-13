import express from 'express';
import {Response,Request,NextFunction} from 'express';
export class Helper {
/*
    public static isUnique(modelName:string, field:string) {
        return function(value:any, next:NextFunction) {
            var Model = require("../models")[modelName];
            let query : any = {};
            query[field]  = value;
            Model.find({where: query, attributes: ["id"]}).then(function(obj:any) {
              if (obj) {
                next(field + ' "' + value + '" is already in use');
              } else {
                next();
              }
            });
          };
    }*/
}