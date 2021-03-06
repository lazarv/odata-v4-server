import * as extend from "extend";
import { Readable } from "stream";

export class ODataStream{
    stream:Readable
    contentType:string

    constructor(stream:Readable, contentType?:string){
        this.stream = stream;
        this.contentType = contentType;
    }
}

export interface IODataResult{
    "@odata.context"?:string
    "@odata.count"?:number
    value?:any
    [x: string]:any
}

export class ODataResult{
    statusCode:number
    body:IODataResult
    elementType:Function
    contentType:string

    constructor(statusCode:number, contentType?:string, result?:any){
        this.statusCode = statusCode;
        if (typeof result != "undefined"){
            this.body = typeof result == "object" && result ? extend({}, result) : result;
            if (result && result.constructor) this.elementType = result.constructor;
            this.contentType = contentType || "application/json";
        }
    }

    static Created = function Created(result:any, contentType?:string):Promise<ODataResult>{
        if (result && typeof result.then == 'function'){
            return result.then((result) => {
                return new ODataResult(201, contentType, result);
            });
        }else{
            return new Promise((resolve, reject) => {
                resolve(new ODataResult(201, contentType, result));
            });
        }
    }

    static Ok = function Ok(result:any, contentType?:string):Promise<ODataResult>{
        let inlinecount;
        if (result && typeof result.then == 'function'){
            return result.then((result) => {
                if (result && Array.isArray(result)){
                    if (result && (<any>result).inlinecount && typeof (<any>result).inlinecount == "number"){
                        inlinecount = (<any>result).inlinecount;
                        delete (<any>result).inlinecount;
                    }
                    result = { value: result };
                    if (typeof inlinecount != "undefined") result["@odata.count"] = inlinecount;
                }else{
                    if (typeof result == "object" && result && typeof inlinecount == "number"){
                        result["@odata.count"] = inlinecount;
                    }
                }
                return new ODataResult(200, contentType, result);
            });
        }else{
            return new Promise((resolve, reject) => {
                if (result && Array.isArray(result)){
                    if (result && (<any>result).inlinecount && typeof (<any>result).inlinecount == "number"){
                        inlinecount = (<any>result).inlinecount;
                        delete (<any>result).inlinecount;
                    }
                    result = { value: result };
                    if (typeof inlinecount == "number") result["@odata.count"] = inlinecount;
                }else{
                    if (typeof result == "object" && result && typeof inlinecount == "number"){
                        result["@odata.count"] = inlinecount;
                    }
                }
                resolve(new ODataResult(200, contentType, result));
            });
        }
    };

    static NoContent = function NoContent(result?:any, contentType?:string):Promise<ODataResult>{
        if (result && typeof result.then == 'function'){
            return result.then((result) => {
                return new ODataResult(204, contentType);
            });
        }else{
            return new Promise((resolve, reject) => {
                resolve(new ODataResult(204, contentType));
            });
        }
    }
}