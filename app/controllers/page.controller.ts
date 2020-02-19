import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';

import { Middleware } from '../middleware/common';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { Page } from '../models/page';
import { PageTranslation } from '../models/page_translation';

export class PageController {

    /**Gets all alerts of the user */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
            try {
                let result = [];
                let myPages = await Page.scope("full").findAll();
                for (let page of myPages) {
                    result.push(page.sanitize(res.locals.language));
                }
                res.json(result);
                //let alerts = await Alert.findAll({order: [sequelize.literal('id DESC')]});
                //for (let alert of alerts) result.push(alert.sanitize(res.locals.language));
                //res.json(alerts);
            } catch(error) {
                next(error);
            }
    }


    /**Update the page setting with the language */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            //
            let myPage = await Page.scope("full").findOne({where:{page: req.body.page.page}});
            if (!myPage) throw new Error("Page not found");
            myPage.image = req.body.page.image;
            await myPage.save();
            let myTrans = myPage.translations.find(obj => obj.iso == res.locals.language);
            if (!myTrans) {
                    myTrans = await PageTranslation.create({pageId:myPage.id, iso:res.locals.language, title:"",description:""});  
            }
            myTrans.title =  req.body.page.title;
            myTrans.description = req.body.page.description;
            await myTrans.save();
            myPage = await Page.scope("full").findOne({where:{page: req.body.page.page}});
            if (!myPage) throw new Error("Page not found");
            res.json(myPage.sanitize(res.locals.language));

        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        }

    }
    /**Update checks */
    static updateChecks() {
        return [
            body('page.page').exists().withMessage('exists').custom(CustomValidators.dBExists(Page,'page')),
            body('page.title').exists().withMessage('exists').isLength({min:10}),
            body('page.description').exists().withMessage('exists').isLength({min:10}),
            body('page.image').exists().withMessage('exists'),
            Middleware.validate()
        ]
    }
}