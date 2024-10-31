const { ifError } = require('assert');
const express = require('express')
const app = express()
const port = 3005
const fileUpload = require('express-fileupload')
const router = express.Router();
const multer = require('multer');

const fs = require('fs');

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH");
    res.setHeader("Access-Control-Allow-Headers",  "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Content-Type", "application/json");
    next(); 
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './')
    },
    filename: function (req, file, cb) {
        //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, "1.wav")
    }
});

const upload = multer({ 
    storage: storage,
    limits: {fileSize: 50 * 1024 *1024}
})

const cargadorMulter = upload.fields([
    {name: 'recording', maxCount: 1}
]);

app.post('/audio', (req, res) =>{
    cargadorMulter(req, res, function (err){
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({error: "Archivo demasiado grande, el limite es 5MB"})
            }
            console.log(err);
        } else{
            console.log("Archivo subido")
            res.status(201).json({
                mensaje: "subido"
            });
        }
    });
})



app.get('/', (req, res) => {
  res.send('Hello World!')
});

// app.use(fileUpload({
//     // Configure file uploads with maximum file size 10MB
//     limits: { fileSize: 1000 * 1024 * 1024 },
  
//     // Temporarily store uploaded files to disk, rather than buffering in memory
//     useTempFiles : true,
//     tempFileDir : '/tmp/'
//   }));
  
//   app.post('/audio', async function(req, res, next) {
//     // Was a file submitted?
//     if (!req.files || !req.files.recording) {
//       return res.status(422).send('No files were uploaded');
//     }
  
//     const uploadedFile = req.files.recording;
  
//     // Print information about the file to the console
//     console.log(`File Name: ${uploadedFile.name}`);
//     console.log(`File Size: ${uploadedFile.size}`);
//     console.log(`File MD5 Hash: ${uploadedFile.md5}`);
//     console.log(`File Mime Type: ${uploadedFile.mimetype}`);
  


// });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});