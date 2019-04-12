import * as express from "express";

    export = (() => {
        
        let router = express.Router();
              
        router.get('/admin', (req, res) => {
            res.json({success: true});
        });
        
        return router;
    })();