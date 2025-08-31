import Prompt from '../models/Prompt.js'
import { sendResponse } from '../utils/responseFunction.js'

export const createPrompt = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const { text } = req.body
    if (!text || !text.trim()) return sendResponse(res, 400, false, 'Prompt text is required')

    const prompt = await Prompt.create({ userId, text: text.trim() })
    return sendResponse(res, 201, true, 'Prompt saved', { prompt })
  } catch (err) {
    next(err)
  }
}

export const getPrompts = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.providerId
    if (!userId) return sendResponse(res, 403, false, 'Authentication required')

    const prompts = await Prompt.find({ userId }).sort({ createdAt: -1 })
    return sendResponse(res, 200, true, 'Prompts fetched', { prompts })
  } catch (err) {
    next(err)
  }
}