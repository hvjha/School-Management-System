import asyncHandler from 'express-async-handler'
import bookModel from '../../../models/library/bookModel.js';
export const addBook = asyncHandler(async(req,res)=>{
     const {title,author,isbn,category,publisher,publishedYear,totalCopies,description,coverImage,shelfLocation} = req.body;
    if(!title || !author || !isbn){
        return res.status(400).json({
            success:false,
            message:"Title, Author and ISBN are required"
        })
    }

    if(publishedYear && publishedYear > new Date().getFullYear()){
        return res.status(400).json({
            success:false,
            message:"Invalid Published year"
        })
    }
    const existing = await bookModel.findOne({isbn});
    if(existing){
        return res.status(400).json({
            success:false,
            message:"ISBN already exists"
        })
    }
    if (totalCopies < 1) {
    return res.status(400).json({
      success: false,
      message: "totalCopies must be at least 1"
    });
  }
    const book = new bookModel({
        title,
        author,
        isbn,category,
        publisher,
        publishedYear,
        totalCopies:totalCopies|| 1,
        availableCopies:totalCopies,
        description,
        coverImage,
        shelfLocation,
        addedBy : req.user._id
    })
    await book.save()
    res.status(201).json({
        success:true,
        message:"Book Added successfully",
        book
    })
})