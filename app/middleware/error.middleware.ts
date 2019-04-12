import { NextFunction, Request, Response } from 'express';
import HttpException from '../classes/HttpException';
import { Server } from '../messages';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
  let text = "Error unknown";
  const name = error.name;
  const status = error.status || 500;
  let message = error.message || 'Something went wrong';
  const errors = error.errors;

  //Translate part !
  const  
        language = (request.acceptsLanguages(Server.acceptableLanguages) || 'en') as string,
        messages = Server.messagesOf(language);

  console.log("Got error name : " + name);
  console.log(error.errors[0].path);
  if (name ==  "SequelizeValidationError") {
    if (error.errors[0].path)
        message = messages.validation(error.errors[0].path);
    response
    .status(200)
    .send({
      status,
      message
    })
  } else {
  response
    .status(status)
    .send({
      status,
      message,
    })
  }
}
 
export default errorMiddleware;