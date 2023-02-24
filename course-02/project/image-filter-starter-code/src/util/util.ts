import fs from "fs";
import Jimp = require("jimp");
import { v4 as uuidv4 } from 'uuid';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            console.debug("inputURL:", inputURL);

            const photo = await Jimp.read(inputURL);
            const outpath = `${__dirname}/tmp/filtered.${uuidv4()}.jpg`;

            photo.resize(256, 256) // resize
                .quality(60) // set JPEG quality
                .greyscale() // set greyscale
                .write(outpath, (img) => {
                    console.debug("outpath", outpath);
                    resolve(outpath);
                });

        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
    for (let file of files) {
        fs.unlinkSync(file);
    }
}
