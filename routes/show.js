const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid', async(req, res) => {
    try{
        const file = await File.findOne({uuid: req.params.uuid});
        if(!file){
            return res.render('download',{error: 'SLink expired!'})
        }

        return res.render('download',{
            uuid: file.uuid,
            filename: file.filename,
            fileSize: file.size,
            download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
            //http://localhost:3000/files/download/cascfas-afvasdr
            //this is the original download link
        });
    }
    catch(err){
        return res.render('download',{error: 'Something went wrong!!'})
    }
});

module.exports = router;