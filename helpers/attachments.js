const cloudinary = require("cloudinary");
// Const fs = require('fs');

exports.uploadResourceToCloudinary = (path, options) => new Promise((resolve, reject) => {

    cloudinary.v2.uploader.upload(
        path,
        options,
        (error, result) => {

            if (!error) {

                resolve({"public_id": result.public_id,
                    "url": result.secure_url});

            } else {

                reject(error);

            }

        }
    );

});

exports.checksCloudinaryEnv = () => new Promise((resolve, reject) => {

    if (process.env.CLOUDINARY_URL) {

        resolve();

    } else {

        reject(new Error("Environment variable CLOUDINARY_URL is not defined."));

    }

});
