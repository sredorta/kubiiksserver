import express from 'express'; //= require('express');
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import {User} from '../models/user';
import {Account} from '../models/account';
import errorMiddleware from '../middleware/error.middleware';
import HttpException from '../classes/HttpException';

const  router = express.Router();


router.get('/api/users' , function(req,res,next) {
    User.create({
        firstName: "sergi",
        email: "test@test.com",
        preferredName: 'WithAccounts',
    }).then((result)=> {
        res.send(result);
    }).catch( (error) => {
        console.log("We got error !!!");
        next(new HttpException(error.name, error.message, error.errors));
        //new HttpException(200, 'Error test !!!!')
    });
});