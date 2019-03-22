const cloudinary = require("cloudinary");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadResourceToCloudinary = (src, options) => new Promise((resolve, reject) => {

    cloudinary.v2.uploader.upload(
        src,
        options,
        (error, result) => {

            if (!error) {

                resolve({
                    "public_id": result.public_id,
                    "url": result.secure_url
                });

            } else {

                reject(error);

            }

        }
    );

});

const uploadResourceToFileSystem = (src) => new Promise(function (resolve, reject) {

    const salt = `${Math.round(new Date().valueOf() * Math.random())}`;
    const public_id = crypto.createHmac("sha256", salt).update(src).
        digest("hex");

    const url = path.join("/uploads", public_id);

    const destination = path.join("public", "uploads", public_id);

    fs.copyFile(src, destination, fs.constants.COPYFILE_EXCL, function (error) {

        if (error) {

            reject(error);

        } else {

            resolve({
                public_id,
                url
            });

        }

    });

});

exports.uploadResource = function (src, options) {

    return new Promise(function (resolve) {

        if (process.env.CLOUDINARY_URL) {

            resolve(uploadResourceToCloudinary(src, options));

        } else {

            resolve(uploadResourceToFileSystem(src));

        }

    });

};

exports.deleteResource = function (public_id) {

    if (process.env.CLOUDINARY_URL) {

        // Delete from Cloudinary.
        cloudinary.api.delete_resources(public_id);

    } else {

        const destination = path.join("public", "uploads", public_id);

        // Delete from local file system.
        fs.unlink(destination, function (error) {

            console.error("Error al borrar el archivo del sistema de ficheros:", error);

        });

    }

};


/**
 * Returns the URL of the image with the given public_id.
 *
 * @param public_id Identifies the image.
 * @param options   Options to build the  URL:
 * @returns {string} The URL of the image.
 */
exports.image = function (public_id, options) {

    if (process.env.CLOUDINARY_URL) {

        return cloudinary.image(public_id, options);

    }

    const src = path.join("/uploads", public_id);
    const width = options.width || "";

    return `<img src='${src}' width='${width}' >`;

};


/**
 * Returns the URL of the mp4 video with the given public_id.
 *
 * @param public_id Identifies the video.
 * @param options   Options to build the  URL:
 * @returns {string} The URL of the video.
 */
exports.video = function (public_id, options) {

    if (process.env.CLOUDINARY_URL) {

        return cloudinary.video(public_id, options);

    }

    const src = path.join("/uploads", public_id);
    const width = options.width || "";
    const controls = options.controls ? "controls" : "";

    return `<video width='${width}' ${controls} >` +
            `   <source src='${src}' type='video/mp4' >` +
            "</video>";

};

exports.checksCloudinaryEnv = () => new Promise((resolve, reject) => {

    if (process.env.CLOUDINARY_URL) {

        resolve();

    } else {

        reject(new Error("La variable de entonrno CLOUDINARY_URL no está definida."));

    }

});
