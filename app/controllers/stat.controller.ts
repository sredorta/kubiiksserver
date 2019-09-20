import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { Stat } from '../models/stat';
import { Stats } from 'fs';
import {Op} from "sequelize";
import { moveSyntheticComments } from 'typescript';


/**Enumerator with all stats events*/
export enum StatAction {
    NAVIGATION_START = "navigation_start",
    APP_START = "app_start",
    APP_END = "app_end",
    SOCIAL_CLICK = "social_click",
    SOCIAL_SHARE = "social_share",
    CHAT_ENTER = "chat_enter",
    CHAT_LEAVE = "chat_leave",
    UNDEFINED = "unknown"
}

export enum StatType {
    APP = "app",
    PAGE = "page",
    SOCIAL_CLICK = "social_click",
    SOCIAL_SHARE = "social_share",
    CHAT = "chat"
}

interface IStatWindow {
    current : number;
    previous:number;
}

class StatResult {
    visits_count : IStatWindow = {current:0,previous:0};
    visits_duration : IStatWindow = {current:0,previous:0};
    visits_hours_histogram : any[] = [];
    visits_over_day : any[] = [];

    constructor() {};

}

export class StatController {

    /**Gets the stat and updates the table depending on the action*/
    static save = async(req: Request, res: Response, next: NextFunction) => {  
        console.log(req.body);
        try {
            switch(req.body.stat.action) {
                //Save the data accordingly
                case StatAction.APP_START: {
                    //Create a new line 
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: req.body.stat.ressource,
                        type: StatType.APP,
                        start: new Date(),
                        end: new Date()
                    });
                    break;
                }
                case StatAction.APP_END: {
                    //Update end time on corresponding line
                    let myStat = await Stat.findOne({where:{session:req.body.stat.session, type:StatType.APP}});
                    if (myStat) {
                        await myStat.update({end: new Date});
                    }
                    //Update latest page end time
                    myStat = await Stat.findOne({
                        where: { session:req.body.stat.session, type:StatType.PAGE},
                        order: [ [ 'createdAt', 'DESC' ]]});
                    if (myStat) {
                        await myStat.update({end: new Date});
                    }
                    break;
                }
                case StatAction.NAVIGATION_START: {
                    //Find latest page navigation and update end
                    let myStat = await Stat.findOne({
                        where: { session:req.body.stat.session, type:StatType.PAGE},
                        order: [ [ 'createdAt', 'DESC' ]]});
                    if (myStat) {
                        await myStat.update({end: new Date});
                    }
                    //create new Entry with next page
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: req.body.stat.ressource,
                        type: StatType.PAGE,
                        start: new Date(),
                        end: new Date()
                    })

                    break;
                }
                case StatAction.SOCIAL_CLICK: {
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: req.body.stat.ressource,
                        type: StatType.SOCIAL_CLICK,
                        start: new Date(),
                        end: new Date()
                    });
                    break;
                }
                case StatAction.SOCIAL_SHARE: {
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: req.body.stat.ressource,
                        type: StatType.SOCIAL_SHARE,
                        start: new Date(),
                        end: new Date()
                    });
                    break;
                }
                case StatAction.CHAT_ENTER: {
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: StatType.CHAT,
                        type: StatType.CHAT,
                        start: new Date(),
                        end: new Date()
                    });
                    break;
                }
                case StatAction.CHAT_LEAVE: {
                    //Find latest chat and update end
                    let myStat = await Stat.findOne({
                        where: { session:req.body.stat.session, type:StatType.CHAT},
                        order: [ [ 'createdAt', 'DESC' ]]});
                    if (myStat) {
                        await myStat.update({end: new Date});
                    }
                    break;
                }
                default: {

                }
            }
        } catch (error) {
            //Do nothing on error
        }
        res.json("");
    }

    /** Role attach parameter validation */
    static saveChecks() {
        return [
            body('stat').exists().withMessage('exists'),
            body('stat.session').exists().withMessage('exists').isLength({min:15}),
            body('stat.action').exists().withMessage('exists').isLength({min:3}),
            body('stat.ressource').exists().withMessage('exists'),

            Middleware.validate()
        ]
    }    



    /**Analyzes the stats and return result*/
    static analyze = async(req: Request, res: Response, next: NextFunction) => {  
        let result : StatResult = new StatResult();
        try {
            const currentTimeWindow = [new Date(new Date().setDate(new Date().getDate()-req.body.days)), new Date()];
            const previousTimeWindow = [new Date(new Date().setDate(new Date().getDate()-2*req.body.days)), new Date(new Date().setDate(new Date().getDate()-req.body.days))];
            
            console.log("WINDOWS !!!!!!!!!!!!!");
            console.log(currentTimeWindow);
            
            //Get all sessions of the period and precedent period
            const currentStats = await Stat.findAll({where:{start: {[Op.between]:currentTimeWindow}}});
            const previousStats = await Stat.findAll({where:{start: {[Op.between]:previousTimeWindow}}});
            //Construct the result ------------------

            //Handle app analysis
            let current = currentStats.filter(obj => obj.type == StatType.APP);
            let previous = previousStats.filter(obj => obj.type == StatType.APP);
            result.visits_count.current = current.length;
            result.visits_count.previous = previous.length;
            result.visits_duration.current = StatController.getAverageDuration(current);
            result.visits_duration.previous = StatController.getAverageDuration(previous);
            //Generate visits per day data
            let visitsOverDay : any[]= [];
            for (let stat of current) {
                let day = new Date(new Date(stat.start).setHours(0,0,0,0)).toDateString();
                let elem = visitsOverDay.find(obj => obj.day == day);
                if (elem) {
                    elem.count = elem.count+1;
                } else {
                    visitsOverDay.push({day:day,count:1})
                }

            }
            //Sort array of objects
            visitsOverDay.sort((val1, val2)=> {return new Date(val1.day).getTime() - new Date(val2.day).getTime()});
            for (let elem of visitsOverDay) {
                result.visits_over_day.push([elem.day, elem.count]);
            }

            //Generate histogram with visiting hours through day
            let days : any = [];
            let histo : any = [];
            for (let i=0; i < 24; i++) {
                histo[i] = 0;
            }
            for (let i=1; i<=8; i++) {
                days[i] = Array.from(histo);
            }
            for (let stat of current) {
                let hour = new Date(stat.start).getHours();
                days[new Date(stat.start).getDay()][hour] =  days[new Date(stat.start).getDay()][hour] + 1;
                days[8][hour] = days[8][hour] + 1;
            }
            for (let j=1; j<=8; j++) {
                result.visits_hours_histogram[j] = [];
                for (let i=0; i < 24; i++) {
                    result.visits_hours_histogram[j].push([i + ' - ' + (i+1) , days[j][i]]);
                }
            }
            console.log(result)
            console.log("HERE ENDS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            

        } catch (error) {
            //Do nothing on error
        }
        res.json(result);
    }

    /** Analyze parameter validation */
    static analyzeChecks() {
        return [
            body('days').exists().withMessage('exists').isNumeric(),
            Middleware.validate()
        ]
    }    

    //////////////////////////////////////////////////////////////
    //  Functions to easy computing
    //////////////////////////////////////////////////////////////
    
    /**Gets elapsed time in seconds between two dates */
    private static getTimeDeltaInSeconds(start:Date, end:Date) {
        return Math.round( (new Date(end).getTime() - new Date(start).getTime())/1000);
    }

    private static getAverageDuration(stats: Stat[]) {
        let result : number = 0;

        if (stats.length ==0) return 0;
        for (let stat of stats) {
            result = result + StatController.getTimeDeltaInSeconds(stat.start,stat.end);    
        }
        result = result / stats.length;
        return parseFloat(result.toFixed(1));
    }



}