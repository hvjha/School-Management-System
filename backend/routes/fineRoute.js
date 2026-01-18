import express from 'express'
import authToken from '../middlewares/authMiddleware.js'
import { permit } from '../middlewares/roleMiddleware.js'
import { payFine } from '../controllers/library/fine/payFine.js'
import { fineReceipt } from '../controllers/library/fine/fineReceipt.js'
import { fineAnalytics } from '../controllers/library/fine/fineAnalytics.js'
import { downloadFineReceipt } from '../controllers/library/fine/downloadFineReceipt.js'
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/library/fine/razorpayController.js'

const fineRoute = express.Router()

fineRoute.post('/pay',authToken,permit('superadmin'),payFine)
fineRoute.post('/create-order', authToken, createRazorpayOrder)
fineRoute.post('/verify-payment', authToken, verifyRazorpayPayment)
fineRoute.post('/receipt/:receiptId',authToken,fineReceipt)
fineRoute.get('/analytics',authToken,permit('superadmin'),fineAnalytics)
fineRoute.get('/receipt-pdf/:receiptId',authToken,downloadFineReceipt)


export default fineRoute