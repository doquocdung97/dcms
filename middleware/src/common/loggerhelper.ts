import {  LoggerHelper as  CMSLoggerHelper} from 'cms';
export class LoggerHelper extends CMSLoggerHelper{
	getModel():string{
    return "middleware"
  }
}