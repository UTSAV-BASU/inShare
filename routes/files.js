const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const {v4: uuid4} = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null,'uploads/'),
    filename: (req, file, cb) => {
            const uniqueName =  `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
            cb(null,uniqueName);  
            }
});

let upload = multer({
    storage: storage,
    limits:{
        fileSize: 1000000*100
           }
    }).single('myfile');


    router.post('/',(req, res, next)=>{
        
           upload(req, res, async (err)=>{
                //1st Step->  Validate request
                if(!req.file){
                    return res.json({error: 'All fields are required!!'});
                }
                
                if(err){
                    return res.status(500).send({error: err.message})
                }
                //2nd step-> Store file in the uploads folder
                //3rd step->  Store data in database

                const file =  new File({
                    filename: req.file.filename,
                    uuid: uuid4(),
                    path: req.file.path,
                    size: req.file.size
                });

                const response = await file.save();
                //4rth Step->  Send the Response i.e. Link
                return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
                // ex:    http://localhost:3000/files/2345bhjcdcds-234vdnjkdxn
                // this is the download page link that will  provide user the page from where user can download the shared file

            });
    });

    router.post('/send',async(req, res, next)=>{
        const {uuid,emailTo,emailFrom} = req.body;
        //validate
        if(!uuid || !emailTo || !emailFrom){
            return res.status(422).send({error:"All fields are required"});
        }

        const file = await File.findOne({uuid:uuid});
        if(file.sender){
            return res.status(422).send({error:"email already exists"});
        }

        file.sender = emailFrom;
        file.reciever = emailTo;

        const response = file.save();

        const sendMail = require('../services/emailService');
        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'inShare file transfering',
            text: `${emailFrom} shared a file with you.`,
            html: require('../services/emailTemplate')({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                size: parseInt(file.size/1000)+' KB',
                expires: '24 hours'
            })
        });
        return res.send({success: true});
    });


module.exports = router;