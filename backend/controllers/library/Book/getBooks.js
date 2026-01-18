import bookModel from "../../../models/library/bookModel.js";
import asyncHandler from 'express-async-handler'
export const getBooks = asyncHandler(async(req,res)=>{
    const {search,category} = req.query
    let filter={}
    if(search){
        filter.$text = {$search:search};
    }
    if(category){
        filter.category = category
    }
    const books = await bookModel.find(filter).sort({createdAt : -1});

    res.json({
        success:true,
        count:books.length,
        books
    })
})