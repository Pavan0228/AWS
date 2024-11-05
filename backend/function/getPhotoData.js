    import AWS from "aws-sdk";

    const dynamoDB = new AWS.DynamoDB.DocumentClient()


    export async function getPhotoData(event){

        const photoData = await dynamoDB.scan({
            TableName: process.env.PHOTO_TABLE,
            Limit: 50
        }).promise()

        return{
            statusbar: 200,
            body: photoData.Items 
        }

    }