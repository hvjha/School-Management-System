import asyncHandler from 'express-async-handler'
import bookModel from '../../../models/library/bookModel.js';

export const deleteBook = asyncHandler(async(req,res)=>{
    const {bookId} = req.params;
    const book = await bookModel.findById(bookId)
    if(!book){
        return res.status(404).json({
            success:false,
            message:"Book Not Found"
        })
    }
    if(book.availableCopies !== book.totalCopies){
        return res.status(400).json({
            success:false,
            message:"Cannot delete book while issued"
        })
    }
    await book.deleteOne();
    res.json({
        success:true,
        message:"Book Deleted successfully"
    })
})