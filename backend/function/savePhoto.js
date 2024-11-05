import AWS from "aws-sdk";
import parser from "lambda-multipart-parser";
import sharp from "sharp";
import pLimit from "p-limit";
import {v4 as uuidv4} from 'uuid';

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const limit = pLimit(3);

const saveFiles = async (file) => {
    const resizedImage = await sharp(file.content)
        .resize({ width: 800 })
        .toBuffer();

    const s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.filename,
        Body: resizedImage,
        ContentType: file.contentType,
    };

    const uploadPromise = s3.putObject(s3Params).promise();
    const labelsPromise = rekognition
        .detectLabels({
            Image: { Bytes: resizedImage },
        })
        .promise();

    const [saveFile, { Labels }] = await Promise.all([
        uploadPromise,
        labelsPromise,
    ]);

    const labels =  Labels.map((label) => label.Name);

    const primary_key = uuidv4();

    await dynamoDB.put({
        TableName: process.env.PHOTO_TABLE,
        Item: {
            primary_key,
            name: file.filename,
            labels
        }
    }).promise();

    return {
        primary_key,
        saveFile: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file.filename}`,
        labels
    };
};

export async function savePhoto(event) {
    const { files } = await parser.parse(event);

    const results = await Promise.all(
        files.map((file) => limit(() => saveFiles(file)))
    );

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Files uploaded successfully",
            results,
        }),
    };
}
