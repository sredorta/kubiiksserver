import multer from "multer";
import {join} from 'path';
import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import { Helper } from "../classes/Helper";
let messagesAll = Helper.translations();

const MAX_IMAGE_SIZE = 1024*1024*2;   //2M
const MAX_VIDEO_SIZE = 1024*1024*100; //100M 

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
    },

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

/**Images of avatars */  
const storageImagesAvatars = multer.diskStorage({    
  destination: function(req, file, cb) {
    cb(null, join(process.cwd(), 'app/public/images/avatar'));
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


/**Parses header and checks file size before uploading */
const imageFilter = (req:any, file:any, callback:any) => {
    try {
      const headers : string[] = req.rawHeaders;
      const index = headers.indexOf("content-length");
      const size = headers[index+1];
      if (Number(size) > MAX_IMAGE_SIZE) {
        return callback(new Error(messagesAll[req.user.language].fileTooLarge));
      }
      callback(null, true)
    } catch (error) {
      callback(null, true)
    }
}  

/**Parses header and checks file size before uploading */
const videoFilter = (req:any, file:any, callback:any) => {
  try {
    const headers : string[] = req.rawHeaders;
    const index = headers.indexOf("content-length");
    const size = headers[index+1];
    if (Number(size) > MAX_VIDEO_SIZE) {
      return callback(new Error(messagesAll[req.user.language].fileTooLarge));
    }
    callback(null, true)
  } catch (error) {
    callback(null, true)
  }
}  


function getFilesizeInBytes(filename:string) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}
const uploadsVideosContent = multer({ storage: storageVideosContent,limits:{fileSize:MAX_VIDEO_SIZE}, fileFilter: videoFilter });
const uploadsVideosBlog = multer({ storage: storageVideosBlog,limits:{fileSize:MAX_VIDEO_SIZE}, fileFilter: videoFilter });


const uploadsImagesContent = multer({ storage: storageImagesContent,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter });
const uploadsImagesBlog = multer({ storage: storageImagesBlog ,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter});
const uploadsImagesEmail = multer({ storage: storageImagesEmail,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter });
const uploadsImagesAvatar = multer({ storage: storageImagesAvatars,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter });

const uploadsDefaults = multer({ storage: storageDefaults,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter });

const uploadsImagesProducts = multer({ storage: storageImagesProducts,limits:{fileSize:MAX_IMAGE_SIZE}, fileFilter: imageFilter});

const uploads = {
    videosContent:     uploadsVideosContent,
    videosBlog: uploadsVideosBlog,
    imagesContent :   uploadsImagesContent,
    imagesBlog:       uploadsImagesBlog,
    imagesEmail:      uploadsImagesEmail,
    imagesDefaults:    uploadsDefaults,
    imagesAvatar:     uploadsImagesAvatar,
    imagesProducts:   uploadsImagesProducts
}


/**Image uploads */
export default uploads ;
