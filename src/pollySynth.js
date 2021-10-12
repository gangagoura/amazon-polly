let AWS = require("aws-sdk");

const pollySynth = async (event) => {
    
    const polly = new AWS.Polly();
    const s3 = new AWS.S3();
    const data = JSON.parse(event.body);
    
    let responseBody = "";
    let statusCode = 0;
    let res = "";
    
    const pollyParams = {
      OutputFormat: "mp3",
      Text: data.text,
      VoiceId: data.voice,
      LanguageCode: 'pt-BR'
      
    };
    
    // 1. Gerando o áudio a partir do texto inserido pelo usuário
    try {
        
        let pollyData = await polly.synthesizeSpeech(pollyParams).promise()
        
        let audioStream = pollyData.AudioStream;
        let key = "test01";
        let s3BucketName = 'polly-dio-live';  
        
        // 2. Salvando o áudio em um repositório do S3
        let params = {
            Bucket: s3BucketName,
            Key: key + '.mp3',
            Body: audioStream
        };
        
        await s3.putObject(params).promise()
        
        responseBody = JSON.stringify("Arquivo de áudio gerado com sucesso!");
        statusCode = 200;

    } catch (error) {
        responseBody = JSON.stringify(error);
        statusCode = 403;
    } 
    
    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': true
        },
        body:responseBody
    };

    return response;
};

module.exports = {
    handler: pollySynth
};
