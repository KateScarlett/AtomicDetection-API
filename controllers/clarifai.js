import {ClarifaiStub, grpc} from "clarifai-nodejs-grpc";
const stub = ClarifaiStub.grpc();

const PAT = process.env.CLARIFAI_PAT;
const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

const handleApiCall = (req,res) => {

    const {url} = req.body;

    stub.PostModelOutputs(
        {
            // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
            model_id: MODEL_ID,
            inputs: [{data: {image: {url: url}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }

            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return;
            }

            res.json(response);
        }
    );
}

export default handleApiCall;