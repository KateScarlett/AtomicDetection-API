const PAT = process.env.CLARIFAI_PAT;
const USER_ID = process.env.CLARIFAI_USER_ID;
const APP_ID = process.env.CLARIFAI_APP_ID;
const MODEL_ID = process.env.CLARIFAI_MODEL_ID;
const MODEL_VERSION_ID = process.env.CLARIFAI_MODEL_VERSION_ID;

const handleApiCall = async (req,res) => {

    const {url} = req.body;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": url
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    try {
        const response = await fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions);
        const data = await response.json();
        if (data) {
            res.json(data);
        } else {
            res.status(400).json('Unable to retrieve api data');
        }
    }catch (e) {
        res.status(400).json('Unable to retrieve api data');
    }
}

export default handleApiCall;