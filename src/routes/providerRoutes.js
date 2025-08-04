import express from 'express';
const router = express.Router();
import { getAllProviders, getProvider, createProvider, updateProvider, deleteProvider } from '../controller/providerController.js';

router.route('/')
  .get(getAllProviders)
  .post(createProvider);

router.route('/:id')
  .get(getProvider)
  .put(updateProvider)
  .delete(deleteProvider);

export default router;