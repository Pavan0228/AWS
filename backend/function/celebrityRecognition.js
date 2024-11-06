import AWS from "aws-sdk";
import parser from "lambda-multipart-parser";

const celebRekognition = new AWS.Rekognition();

const UploadImg = async (file) => {
    const celebParams = {
        Image: {
            Bytes: file.content,
        },
    };

    const celebResult = await celebRekognition.recognizeCelebrities(celebParams).promise();

    return celebResult;
}


export async function celebrityRecognition(event) {

    const { files } = await parser.parse(event);

    const results = await Promise.all(
        files.map((file) =>UploadImg(file))
    );
        return {
            statusCode: 200,
            body: JSON.stringify(results),
        };
}