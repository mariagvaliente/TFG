// PUT /users/:userId/participants/:turnId
exports.add = (req, res, next) => {

    req.turn.addParticipant(req.user)
    .then(() => {
        if (req.xhr) {
            res.send(200);
        } else {
            res.sendStatus(415);
        }
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
};


// DELETE /users/:userId/participants/:turnId
exports.del = (req, res, next) => {

    req.turn.removeParticipant(req.user)
    .then(() => {
        if (req.xhr) {
            res.send(200);
        } else {
            res.sendStatus(415);
        }
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
};
