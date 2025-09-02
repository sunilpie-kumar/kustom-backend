import Appointment from '../models/Appointment.js'
import Service from '../models/Service.js'
import { sendResponse } from '../utils/responseFunction.js'
import { getIO } from '../realtime/socket.js'

export const createAppointment = async (req, res, next) => {
  try {
    const { providerId, serviceId, scheduledAt, durationMinutes, note } = req.body
    const userId = req.user?.userId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')
    if (!providerId || !scheduledAt) return sendResponse(res, 400, false, 'providerId and scheduledAt are required')

    // Optional: ensure service exists and belongs to provider
    if (serviceId) {
      const svc = await Service.findById(serviceId)
      if (!svc) return sendResponse(res, 404, false, 'Service not found')
    }

    const appt = await Appointment.create({ userId, providerId, scheduledAt: new Date(scheduledAt), durationMinutes: durationMinutes || 30, note })
    const io = getIO()
    if (io) {
      io.to(`provider:${String(providerId)}`).emit('appointment:new', { appointment: appt })
    }
    return sendResponse(res, 201, true, 'Appointment scheduled', { appointment: appt })
  } catch (e) { next(e) }
}

export const getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user?.userId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')
    const list = await Appointment.find({ userId }).sort({ scheduledAt: -1 })
    return sendResponse(res, 200, true, 'Appointments fetched', { appointments: list })
  } catch (e) { next(e) }
}

export const getProviderAppointments = async (req, res, next) => {
  try {
    const providerId = req.user?.providerId
    if (!providerId) return sendResponse(res, 403, false, 'Authentication required')
    const list = await Appointment.find({ providerId }).sort({ scheduledAt: -1 })
    return sendResponse(res, 200, true, 'Appointments fetched', { appointments: list })
  } catch (e) { next(e) }
}