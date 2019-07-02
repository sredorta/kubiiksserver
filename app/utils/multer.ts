import multer from "multer";
import {join} from 'path';

/**Images of product */  
const storageDefaults = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/images/defaults'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
}); 

/**Images of content */
const storageImagesContent = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/images/content'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

/**Images of blog */
const storageImagesBlog = multer.diskStorage({    
    destination: function(req, file, cb) {
      cb(null, join(process.cwd(), 'app/public/images/blog'));
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });

  /**Images of email */
const storageImagesEmail = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/images/email'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

/**Images of product */  
const storageImagesProducts = multer.diskStorage({    
    destination: function(req, file, cb) {
      cb(null, join(process.cwd(), 'app/public'));
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });  

const uploadsImagesContent = multer({ storage: storageImagesContent });
const uploadsImagesBlog = multer({ storage: storageImagesBlog });
const uploadsImagesEmail = multer({ storage: storageImagesEmail });
const uploadsDefaults = multer({ storage: storageDefaults });

const uploadsImagesProducts = multer({ storage: storageImagesProducts });

const uploads = {
    content :   uploadsImagesContent,
    blog:       uploadsImagesBlog,
    email:      uploadsImagesEmail,
    defaults:    uploadsDefaults,
    products:   uploadsImagesProducts
}


/**Image uploads */
export default uploads ;
