const express = require('express');
const router = express.Router();
const { createYouthProfile, getAllYouth, getYouthById } = require('../controllers/youthController');

router.get('/', getAllYouth);
router.post('/', createYouthProfile);
router.get('/:id', getYouthById);

module.exports = router;
