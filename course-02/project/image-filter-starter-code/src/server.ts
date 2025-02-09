import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { NextFunction } from 'connect';
import validator from 'validator';

//imageUrlValidator middleware validates if the image_url query string is valid.
//INPUTS
//  standard req, res and next()
//RETURNS
//  if the image_url query string exists and valid, calls the next()
//  otherwise, returns HTTP status 400 (Bad request)
function imageUrlValidator(req: Request, res: Response, next: NextFunction) {
    if (!req.query || !req.query.image_url) {
        return res.status(400).send({ message: 'Image URL required!' });
    }

    if (typeof req.query.image_url !== "string" || !validator.isURL(req.query.image_url)) {
        return res.status(400).send({ message: 'Invalid Image URL!' });
    }

    return next();
}

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    //image filter
    app.get("/filteredimage", imageUrlValidator, async (req, res) => {
        const image_url = req.query.image_url as string;
        console.debug("image_url:", image_url);

        try {
            const filteredpath = await filterImageFromURL(image_url);
            console.debug("filteredpath", filteredpath);

            res.sendFile(filteredpath, () => {
                deleteLocalFiles([filteredpath]);
            });

        } catch (error) {
            console.error(error);
            res.status(500).send({
                message: `Error occurred when filtering public image!`,
            });
        }
    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();