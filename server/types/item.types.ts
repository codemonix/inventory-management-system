import { Document } from 'mongoose';
import { Request } from 'express';



export interface IItem extends Document {
    name: string;
    nameLower: string;
    code: string;
    imageUrl?: string;
    category?: string;
    price?: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateItemDTO {
    name: string;
    category: string;
    price: number;
}

export interface UpdateItemDTO {
    name: string;
    category?: string;
    price?: number;
}


export interface QueryItemsDTO {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    ids?: string[];   // only these items (e.g. the lines of a draft transfer)
}

export interface ItemParams {
    itemId: string;
}

export interface RequestWithItemCode<P = ItemParams, ResBody = any, ReqBody = any, ReqQuery = any> 
    extends Request<P, ResBody, ReqBody, ReqQuery> {
    itemCode: string;
}



