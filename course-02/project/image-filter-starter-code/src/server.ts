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

    const { image_url } = req.query;

    if (validator.isURL(image_url)) {
        return next();
    }

    return res.status(400).send({ message: 'Invalid Image URL!' });
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
        try {
            const { image_url } = req.query;
            const filteredpath = await filterImageFromURL(image_url);

            res.sendFile(filteredpath);
            
            //deleteLocalFiles([filteredpath]);
        } catch (error) {
            res.status(502).send("Error occurred!");
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