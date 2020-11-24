import { v4 as uuidv4 } from 'uuid';

export class Record {
  constructor (body, headers, statusCode) {
    this.body = body;
    this.headers = headers;
    this.statusCode = statusCode;
    this.id = uuidv4().toString();
  }
}
