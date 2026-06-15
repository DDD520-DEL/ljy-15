/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import artistsRoutes from './routes/artists'
import stylesRoutes from './routes/styles'
import regionsRoutes from './routes/regions'
import favoritesRoutes from './routes/favorites'
import bookingsRoutes from './routes/bookings'
import reviewsRoutes from './routes/reviews'
import notificationsRoutes from './routes/notifications'
import recommendationsRoutes from './routes/recommendations'
import userRoutes from './routes/user'
import applicationsRoutes from './routes/applications'
import couponsRoutes from './routes/coupons'
import feedbacksRoutes from './routes/feedbacks'
import announcementsRoutes from './routes/announcements'
import priceCalendarRoutes from './routes/price-calendar'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/artists', artistsRoutes)
app.use('/api/styles', stylesRoutes)
app.use('/api/regions', regionsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/recommendations', recommendationsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/coupons', couponsRoutes)
app.use('/api/feedbacks', feedbacksRoutes)
app.use('/api/announcements', announcementsRoutes)
app.use('/api/price-calendar', priceCalendarRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
