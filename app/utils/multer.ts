import multer from "multer";
import {join} from 'path';


const storage = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploads = multer({ storage: storage });

export default uploads ;