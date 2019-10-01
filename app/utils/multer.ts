import multer from "multer";
import {join} from 'path';
import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';

/**videos of content*/  
const storageVideosContent = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/videos/content'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
}); 

/**videos of blog*/  
const storageVideosBlog = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/videos/blog'));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
}); 


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


const uploadsVideosContent = multer({ storage: storageVideosContent });
const uploadsVideosBlog = multer({ storage: storageVideosBlog });


const uploadsImagesContent = multer({ storage: storageImagesContent});//,limits:{fileSize:1024*1024*1} });
const uploadsImagesBlog = multer({ storage: storageImagesBlog});//,limits:{fileSize:1024*1024*1}});
const uploadsImagesEmail = multer({ storage: storageImagesEmail });
const uploadsDefaults = multer({ storage: storageDefaults });

const uploadsImagesProducts = multer({ storage: storageImagesProducts });

const uploads = {
    videosContent:     uploadsVideosContent,
    videosBlog: uploadsVideosBlog,
    imagesContent :   uploadsImagesContent,
    imagesBlog:       uploadsImagesBlog,
    imagesEmail:      uploadsImagesEmail,
    imagesDefaults:    uploadsDefaults,
    imagesProducts:   uploadsImagesProducts
}


/**Image uploads */
export default uploads ;
