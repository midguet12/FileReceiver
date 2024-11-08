const express = require('express');
const app = express();
const port = 3005;
const multer = require('multer');
const axios = require("axios");
const path = require('path');

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
        cb(null, './audios/user')
    },
    filename: function (req, file, cb) {
        const currentDate = new Date(Date.now());
        fileName = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}-${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}-${currentDate.getMilliseconds()}.mp3`;
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
    cargadorMulter(req, res, async function (err){
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({error: "Archivo demasiado grande, el limite es 50MB"})
            }
            console.log(err);
        } else{
            const server = '192.168.0.205';
            const currentDate = new Date(Date.now());
            console.log(`Archivo ${fileName} subido a las ${currentDate.getHours()}:${currentDate.getMinutes()}`);

            const requestWithAudioPath = {
                path_audio_voice: `/ecoterra_files/audio/user/${fileName}`
            }
            try {
                const textFromAudio = await axios.post(`http://${server}:7004/process_voice`, requestWithAudioPath);
                
                if (textFromAudio != null) {
                    console.log(`Texto recibido (conversión de audio a texto): ${textFromAudio.data.text}`)
                    const textQuestion = {
                        text: textFromAudio.data.text
                    };
                    const answerText = await axios.post(`http://${server}:7000/constanza/listens`, textQuestion);

                    if (answerText!=null) {
                        console.log(`Texto recibido (respuesta de chatbot): ${answerText.data.result}`)
                        const audioPathRequest = {
                            text: answerText.data.result
                        }
                        const responseAudioPathRequest = await axios.post(`http://${server}:7004/voice_response`, audioPathRequest);
                        console.log(`Nombre de audio a enviar: ${responseAudioPathRequest.data.result}`)
                        const options = {
                            root: path.join(__dirname)
                        }
                        const fileForSending = `/audios/chatbot/${responseAudioPathRequest.data.result}`;
                        res.sendFile(fileForSending, options, function(err){
                            if (err) {
                                console.log(err)
                            } else{
                                console.log(`Archivo ${fileForSending} enviado.`)
                            }
                        });


                    } else {
                        console.log("Voice response sent null response.");
                    }
                } else{
                    console.log('Process voice sent null response.')
                }

                
                
                
                
                
            } catch (error) {
                console.log(error.message)
            }           
        }
    });

})

app.get('/helloworld', (req, res) =>{
    res.status(201).json({
        message: "Hola como estas"
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});