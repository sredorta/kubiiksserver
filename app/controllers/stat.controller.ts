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
    CHAT_MESSAGE = "chat_message",
    APP_INSTALL = "app_install",
    UNDEFINED = "unknown"
}

export enum StatType {
    APP = "app",
    PAGE = "page",
    SOCIAL_CLICK = "social_click",
    SOCIAL_SHARE = "social_share",
    APP_INSTALL = "app_install",
    CHAT = "chat",
    CHAT_MESSAGE = "chat_message"

}

interface IStatWindow {
    current : number;
    previous:number;
}

class StatResult {
    visits_count : IStatWindow = {current:0,previous:0};
    visits_duration : IStatWindow = {current:0,previous:0};
    pages_count : IStatWindow = {current:0,previous:0};
    pages_per_visit : IStatWindow = {current:0,previous:0};
    social_click_count : IStatWindow = {current:0,previous:0};
    chat_click_count : IStatWindow = {current:0,previous:0};
    chat_duration : IStatWindow = {current:0,previous:0};
    chat_message_count : IStatWindow = {current:0,previous:0};
    app_install_count : IStatWindow = {current:0,previous:0};

    visits_hours_histogram : any[] = [];
    visits_over_day : any[] = [];
    referrals_histogram : any[] = [];
    social_histogram : any[] = [];
    social_over_day: any = {};
    pages_visited_histogram : any = {};

    languages : any[] = [];

    constructor() {};

}

export class StatController {

    /**Gets the stat and updates the table depending on the action*/
    static save = async(req: Request, res: Response, next: NextFunction) => {  
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
                case StatAction.CHAT_MESSAGE: {
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: StatType.CHAT_MESSAGE,
                        type: StatType.CHAT_MESSAGE,
                        start: new Date(),
                        end: new Date()
                    });
                    break;
                }
                case StatAction.APP_INSTALL: {
                    await Stat.create({
                        session: req.body.stat.session,
                        ressource: StatType.APP_INSTALL,
                        type: StatType.APP_INSTALL,
                        start: new Date(),
                        end: new Date()
                    });
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

    /**Removes all stats from the database */
    static delete = async(req: Request, res: Response, next: NextFunction) => {  
        try {
            await Stat.destroy({where:{}});
            res.json(new StatResult());

        } catch(error) {
            next(new HttpException(500, error,null));
        }
    }
    /** Analyze parameter validation */
    static deleteChecks() {
        return [
            Middleware.validate()
        ]
    }    

    /**Analyzes the stats and return result*/
    static analyze = async(req: Request, res: Response, next: NextFunction) => {  
        let result : StatResult = new StatResult();
        try {
            req.body.days = req.body.days-1;
            const todayStart = new Date(new Date().setHours(0,0,0,0));
            const todayEnd = new Date(new Date().setHours(23,59,59,0));
            const currentTimeWindow = [new Date(new Date(todayStart).setDate(new Date(todayEnd).getDate()-req.body.days)), new Date(todayEnd)];
            const previousTimeWindow = [new Date(new Date(todayStart).setDate(new Date(todayEnd).getDate()-2*req.body.days-1)), new Date(new Date(todayEnd).setDate(new Date(todayStart).getDate()-req.body.days-1))];
            //console.log(currentTimeWindow);
            //console.log(previousTimeWindow);

            //Get all sessions of the period and precedent period
            const currentStats = await Stat.findAll({where:{start: {[Op.between]:currentTimeWindow}}});
            const previousStats = await Stat.findAll({where:{start: {[Op.between]:previousTimeWindow}}});
            //Construct the result ------------------

            //APP DATA
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
            for (let i=0; i<=7; i++) {
                days[i] = Array.from(histo);
            }
            for (let stat of current) {
                let hour = new Date(stat.start).getHours();
                days[new Date(stat.start).getDay()][hour] =  days[new Date(stat.start).getDay()][hour] + 1;
                days[7][hour] = days[7][hour] + 1;
            }

            for (let j=0; j<=7; j++) {
                result.visits_hours_histogram[j] = [];
                for (let i=0; i < 24; i++) {
                    result.visits_hours_histogram[j].push([i + ' - ' + (i+1) , days[j][i]]);
                }
            }

            //Generate referral histograms
            let referrals : any = [];
            for (let stat of current) {
                let href : string = "direct";
                if (stat.ressource) {
                    href = stat.ressource.replace(/(^\w+:|^)\/\//, '');
                    href = href.replace(/\/.*/,'');
                } 
                if (!referrals[href]) referrals[href] = 1;
                else referrals[href] = referrals[href] + 1;
                referrals[href]
            }
            Object.keys(referrals).forEach((key) => {
                result.referrals_histogram.push([key,referrals[key]]);
            });


            //PAGES DATA
            current = currentStats.filter(obj => obj.type == StatType.PAGE);
            previous = previousStats.filter(obj => obj.type == StatType.PAGE);

            result.pages_count.current = current.length;
            result.pages_count.previous = previous.length;
            if (result.visits_count.current>0) {
                result.pages_per_visit.current = parseFloat(Number(result.pages_count.current/result.visits_count.current).toFixed(2));
            }
            if (result.visits_count.previous>0) {
                result.pages_per_visit.previous = parseFloat(Number(result.pages_count.previous/result.visits_count.previous).toFixed(2));;
            }

            //Generate pages visited language chart pie
            let languages :any = [];
            histo = [];
            for (let page of current) {
                let name = page.ressource;
                if (name.search(/^\/[a-z][a-z]\//)>=0) {
                    let tail = name.replace(/^\/[a-z][a-z]\//, '');
                    let lang = name.replace(tail, '');
                    lang = lang.replace(/\//g,'');
                    if (!languages[lang]) languages[lang] = 1;
                    else languages[lang] = languages[lang] + 1; 
                    if (!histo[lang]) histo[lang] = [];
                    let tmp = histo[lang];
                    if(!tmp[tail]) tmp[tail] = 1;
                    else tmp[tail] = tmp[tail] + 1;
                    histo[lang] = tmp; 
                }
            }
            Object.keys(languages).forEach((key) => {
                result.languages.push([key,languages[key]]);
                result.pages_visited_histogram[key] = [];
                Object.keys(histo[key]).forEach((keyHisto) => {
                    result.pages_visited_histogram[key].push([keyHisto,histo[key][keyHisto]]);
                });
            });

            //SOCIAL DATA
            current = currentStats.filter(obj => obj.type == StatType.SOCIAL_CLICK);
            previous = previousStats.filter(obj => obj.type == StatType.SOCIAL_CLICK);
            result.social_click_count.current = current.length;
            result.social_click_count.previous = previous.length;

            //Generate histogram for each social ressource
            histo = [];
            for (let stat of current) {
                if (!histo[stat.ressource]) histo[stat.ressource] = 1;
                else histo[stat.ressource] = histo[stat.ressource] + 1;
            }
            Object.keys(histo).forEach((key) => {
                result.social_histogram.push([key,histo[key]]);
            });

            Object.keys(histo).forEach((social) => {
                let socialOverDay : any[]= [];
                let currentSocial = current.filter(obj => obj.ressource == social);
                for (let stat of currentSocial) {
                    let day = new Date(new Date(stat.start).setHours(0,0,0,0)).toDateString();
                    let elem = socialOverDay.find(obj => obj.day == day);
                    if (elem) {
                        elem.count = elem.count+1;
                    } else {
                        socialOverDay.push({day:day,count:1})
                    }
                }
                //Sort array of objects
                socialOverDay.sort((val1, val2)=> {return new Date(val1.day).getTime() - new Date(val2.day).getTime()});
                let tmp = [];
                for (let elem of socialOverDay) {
                    tmp.push([elem.day, elem.count]);
                }
                result.social_over_day[social] = tmp;
            });
            //Now generate all field
            let socialOverDay : any[]= [];
            for (let stat of current) {
                let day = new Date(new Date(stat.start).setHours(0,0,0,0)).toDateString();
                let elem = socialOverDay.find(obj => obj.day == day);
                if (elem) {
                    elem.count = elem.count+1;
                } else {
                    socialOverDay.push({day:day,count:1})
                }
            }
            //Sort array of objects
            socialOverDay.sort((val1, val2)=> {return new Date(val1.day).getTime() - new Date(val2.day).getTime()});
            let tmp = [];
            for (let elem of socialOverDay) {
                tmp.push([elem.day, elem.count]);
            }
            result.social_over_day['all'] = tmp;
            

            //CHAT DATA
            current = currentStats.filter(obj => obj.type == StatType.CHAT);
            previous = previousStats.filter(obj => obj.type == StatType.CHAT);
            
            result.chat_click_count.current = current.length;
            result.chat_click_count.previous = previous.length;
            result.chat_duration.current = StatController.getAverageDuration(current);
            result.chat_duration.previous = StatController.getAverageDuration(previous);

            current = currentStats.filter(obj => obj.type == StatType.CHAT_MESSAGE);
            previous = previousStats.filter(obj => obj.type == StatType.CHAT_MESSAGE);
            result.chat_message_count.current = current.length;
            result.chat_message_count.previous = previous.length;
            //APP DATA
            current = currentStats.filter(obj => obj.type == StatType.APP_INSTALL);
            previous = previousStats.filter(obj => obj.type == StatType.APP_INSTALL);
            result.app_install_count.current = current.length;
            result.app_install_count.previous = previous.length;          
            
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