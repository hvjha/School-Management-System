import express from 'express'
import authToken from '../middlewares/authMiddleware.js'
import { permit } from '../middlewares/roleMiddleware.js'
import { addBook } from '../controllers/library/Book/addBook.js'
import { getBooks } from '../controllers/library/Book/getBooks.js'
import { updateBook } from '../controllers/library/Book/updateBook.js'
import { deleteBook } from '../controllers/library/Book/deletedBook.js'
import {issueBooks} from '../controllers/library/Issue/issueBook.js'
import { returnBook } from '../controllers/library/Issue/ReturnBook.js'
import { studentLibraryHistory } from '../controllers/library/Issue/studentFullHistory.js'
import { libraryReport } from '../controllers/library/Issue/libraryReport.js'
import { reserveBook } from '../controllers/library/Reservation/reserveBook.js'
import { cancleReservation } from '../controllers/library/Reservation/cancleReservation.js'
import { studentReservationHistory } from '../controllers/library/Reservation/studentReservationHistory.js'
import { allReservations } from '../controllers/library/Reservation/allReservations.js'
import { fulfillReservation } from '../controllers/library/Reservation/fulfillReservation.js'
import { getIssuedBooksByStudent } from '../controllers/library/Issue/issuedBooks.js'

const libraryRoute = express.Router()

libraryRoute.post('/book/add',authToken,permit('superadmin'),addBook)
libraryRoute.get('/book/books',getBooks)
libraryRoute.post('/book/update/:bookId',authToken,permit('superadmin'),updateBook)
libraryRoute.delete('/book/delete/:bookId',authToken,permit('superadmin'),deleteBook)

libraryRoute.post('/book/issue',authToken,permit('superadmin'),issueBooks)
libraryRoute.put('/book/return/:issueId',authToken,permit('superadmin'),returnBook)
libraryRoute.get('/book/issued/:studentId',authToken,permit('superadmin'),getIssuedBooksByStudent)


libraryRoute.get('/history/student/:studentId',authToken,studentLibraryHistory)
libraryRoute.get("/history/library",authToken,permit('superadmin'),libraryReport)

libraryRoute.post('/book/reservation',authToken,permit('trainer'),reserveBook)
libraryRoute.delete('/book/reservation/cancel/:reservationId',authToken,permit('trainer', 'superadmin'),cancleReservation)
libraryRoute.post('/book/reservation/fulfill/:reservationId',authToken,permit('superadmin'),fulfillReservation)
libraryRoute.get('/book/reservation/trainer',authToken,permit('trainer'),studentReservationHistory)
libraryRoute.get("/book/reservation/all",authToken,permit('superadmin'),allReservations)

export default libraryRoute