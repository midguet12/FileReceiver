const express = require('express');
const app = express();
const port = 3005;
const multer = require('multer');
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");
const { text } = require('body-parser');

ffmpeg.setFfmpegPath(ffmpegStatic);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH");
    res.setHeader("Access-Control-Allow-Headers",  "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Content-Type", "application/json");
    next();
})

var fileName = '';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './audios')
    },
    filename: function (req, file, cb) {
        const currentDate = new Date(Date.now());
        fileName = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}-${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}-${currentDate.getMilliseconds()}.mp`;
        cb(null, fileName)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {fileSize: 50 * 1024 *1024}
})

const cargadorMulter = upload.fields([
    {name: 'recording', maxCount: 1}
]);

app.post('/audio', async (req, res) =>{
    cargadorMulter(req, res, function (err){
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({error: "Archivo demasiado grande, el limite es 5MB"})
            }
            console.log(err);
        } else{
            const currentDate = new Date(Date.now());
            //console.log("Archivo subido a las " + currentDate.getHours() +":" + currentDate.getMinutes());
            console.log(`Archivo ${fileName} subido a las ${currentDate.getHours()}:${currentDate.getMinutes()}`);
            
            const processVoiceRequest = new FormData();
            processVoiceRequest.append('path_audio_voice', fileName)
            const textAudio = axios.post('http://192.168.0.205:7004/process_voice', processVoiceRequest);
            
            const textAudioRequest = new FormData();
            textAudioRequest.append('text', textAudio.data.path_audio_voice);
            const responseText = axios.post('http://192.168.0.205:7000/constanza/listens', textAudioRequest);

            const answerAudioPathRequest = new FormData();
            answerAudioPathRequest.append('text', responseText.data.text)
            const answerAudioPath = axios.post('http://192.168.0.205:7004/voice_response',answerAudioPathRequest)

            res.status(201).json({
                path: answerAudioPath
            });
        }
    });

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});