import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';




export class UserController {

    static testRoles = async(req: Request, res: Response, next: NextFunction) => {    

        //TODO switch to await/async
        async function work() {
            try {
                let myUser = await User.findOne();
                if (myUser)
                    await myUser.destroy();
                myUser = await User.create({firstName: "sergi",
                    lastName: "redorta",
                    email: "sergi.redorta@hotmail.com",
                    phone: "0423133212",
                    mobile: "0623133212",
                    language:req.user.language,
                    password: "Hello1234",
                    emailValidationKey: Helper.generateRandomString(30),
                    mobileValidationKey: Helper.generateRandomNumber(4)});
                
                let myRole1 = await Role.findByPk(1);
                let myRole2 = await Role.findByPk(2);

                console.log(myRole1);   
                if (myRole1 && myRole2)  
                    await myUser.$add('Role',[myRole1, myRole2]);   
                //let myRoles : Role[] = []; 
                if (myUser) {
                let myRoles =  await myUser.$get('Roles');
                myUser = await User.scope("withRoles").findOne();
                console.log(myRoles);    
                res.json(myUser);
                }
                //result.roles.create({name:"admin"}).then({
            } catch(error) {
                console.log("We got error !!!");
                next(new HttpException(400, error.message, error.errors));
            };
        }
        work();
    }


    static create = async(req: Request, res: Response, next: NextFunction) => {                 
        //TODO switch to await/async
        let params = User.build({id:"test"});

        User.create({
            firstName: "sergi",
            email: "test@test.test",
            preferredName: 'WithAccounts',
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            next(new HttpException(400, error.message, error.errors));
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    //Get all users
    ///////////////////////////////////////////////////////////////////////////
    static getAll = async(req: Request, res: Response, next: NextFunction) => {
        console.log("Get all users");
        console.log("Logged in user:");
        console.log(req.user);
        res.json(await User.scope("withRoles").findAll());
/*
        User.findAll()
        .then((result)=> {
            res.json(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            next(new HttpException(500, error.message, error.errors));
        });*/
    }

    ///////////////////////////////////////////////////////////////////////////
    //Get user by ID
    ///////////////////////////////////////////////////////////////////////////
    static getOneById = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.body.id;
         //Do not include password and others
        User.findByPk(id)
        .then(result => {
            res.json(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            console.log(error);
            next(new HttpException(500, error.message, error.errors));
        });
    }   
    //Get user by ID CHECKS
    public static getUserByIdChecks() {
        return [
            body('id').exists().isUUID("all"),
            Middleware.validate()
        ]        
        //return Middleware.validation(GetUserByIdDTO);
    }

    static tmp = async (req: Request, res: Response, next: NextFunction) => {
        let myUser : User | null;
        let myAccount : Account;
        try {
            myUser = await User.create({
                firstName: "sergi",
                lastName: "redorta",
                email: "sergi.redorta@hotmail.com",
                phone: "0423133212",
                mobile: "0623133212",
                language: req.user.language,
                password: "Hello1234",
                emailValidationKey: Helper.generateRandomString(30),
                mobileValidationKey: Helper.generateRandomNumber(4)
            });
            /*myAccount = await myUser.createAccount({
                password: Account.hashPassword("Hello1234")
            });
            myAccount = await myUser.createAccount({
                    access: "admin",
                    password: Account.hashPassword("Hello1234")
                });   */
            myUser = await User.findOne();//{include:[{model: Account}] });
            res.json(myUser);
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        };
    }


    /////////////////////////////////////////////////////////////////////////////////////
    //TESTING PARAMS

    static test = async (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(JSON.stringify("Hello")));
        console.log(JSON.parse(JSON.stringify({"test":"test","hello":"world"})));

        res.json("SUCCESS !!!");
    }
    /**Parameter validation */
    static testchecks() {
        return [
            body('firstName').custom(CustomValidators.nameValidator('firstName')),
            body('lastName').custom(CustomValidators.nameValidator('lastName')),
            body('email').exists().withMessage('exists').isEmail(),
            body('phone').custom(CustomValidators.phone('phone')),
            body('mobile').custom(CustomValidators.mobile('mobile')),
            body('password').exists().withMessage('exists').custom(CustomValidators.password()),
            body('terms').exists().withMessage('exists').custom(CustomValidators.checked()),
            body('terms').custom(CustomValidators.dBuserNotPresent(User)),
            Middleware.validate()
        ]
    }    
    static conditional() {

    }

}