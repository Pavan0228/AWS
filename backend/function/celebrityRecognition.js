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
        files.map((file) => UploadImg(file))
    );

    const filteredResults = results.map(result => ({
        CelebrityFaces: result.CelebrityFaces.map(face => ({
            Urls: face.Urls,
            Name: face.Name,
            Id: face.Id,
            Face: {
                BoundingBox: face.Face.BoundingBox,
                Confidence: face.Face.Confidence,
                Emotions: face.Face.Emotions
                    .sort((a, b) => b.Confidence - a.Confidence)
                    .slice(0, 3) 
            },
            MatchConfidence: face.MatchConfidence,
            KnownGender: face.KnownGender
        })),
        UnrecognizedFaces: result.UnrecognizedFaces?.map((face) => ({
            Emotions: face.Emotions
                .sort((a, b) => b.Confidence - a.Confidence)
                .slice(0, 3),
        }))
    }));
    
    return {
        statusCode: 200,
        body: JSON.stringify(filteredResults)
    };
}
