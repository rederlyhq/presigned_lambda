/**
 * This was a modified amazon example
 */
'use strict'

const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' })
const s3 = new AWS.S3({
    endpoint: process.env.AWS_S3_ENDPOINT
})

// Main Lambda entry point
exports.handler = async (event) => {
    console.log('Presigned handler invoked')
  var bucket = ''
  var prefix = ''
  
  bucket = process.env.AttachmentUploadBucket
if (!event) {
    return {
      "statusCode": 400,
      "body": 'No event'
    };
  }

  if (!event.path) {
    return {
      "statusCode": 400,
      "body": 'No path'
    };
  }

    // Omit the leading /
    prefix = event.path.slice(1);

  const result = await getUploadURL(bucket, prefix)
  console.log('Result: ', result)
  return result
}

// bucket - The S3 bucket to use
// prefix - The directory path to use
const getUploadURL = async function(bucket, prefix) {
  const actionId = uuidv4()
  
  const s3Params = {
    Bucket: bucket,
    Key: prefix === '' ? actionId : `${prefix}/${actionId}`
    //ACL: 'public-read'      // Enable this setting to make the object publicly readable - only works if the bucket can support public objects
  }

  console.log('getUploadURL: ', s3Params)
  return new Promise((resolve, reject) => {
    // Get signed URL
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
          "uploadURL": s3.getSignedUrl('putObject', s3Params),
          "photoFilename": `${actionId}`
      })
    })
  })
}
