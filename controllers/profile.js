const handleProfile = (req, res, next, db) => {
    const {id} = req.params;
    db.select('*')
        .from('users')
        .where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Unable to retrieve profile');
            }
        }).catch(err => res.status(400).json('error Unable to retrieve profile'));
};

export default handleProfile;