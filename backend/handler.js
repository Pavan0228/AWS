import AWS from "aws-sdk";
import parser from "lambda-multipart-parser";

const s3 = new AWS.S3();

const saveFiles = async (file) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.filename,
        Body: file.content,
        ContentType: file.contentType,
    };

    const saveFile = await s3.putObject(params).promise();

    return saveFile;
};

export async function savePhoto(event) {
    const { files } = await parser.parse(event);

    files.forEach(saveFiles);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Go Serverless v4! Your function executed successfully!",
            input: await parser.parse(event),
        }),
    };
}
