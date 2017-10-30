import express from 'express';
let router = express.Router();

router.route('/bucketlists')
  .get((req, res) => {
    res.status(200).json({lis: "ahfua"});
  })

export default router;
