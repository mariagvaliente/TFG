// PUT /users/:userId/participants/:turnId

exports.add = (req, res, next) => {
    console.log("Marcado como turno");
    var direccion = req.body.redir || '/users/' + req.user.id + '/participants';
    req.user.addParticipante(req.turno).then(function(){
        res.redirect(direccion);
    }).catch(function(error){next(error);})
};



// GET /users/:userId/participants

exports.show = function(req,res,next){
    console.log("show participants");
    req.user.getParticipante().then(function(participantes){
            participantes.forEach(function(participante){
                participante.isFav = participantes.some(function(part) {return part.id == participante.id});
            });
            res.render('users/index.ejs',{users:participantes, errors:[]});


    }).catch(function(error){ next(error);})

};
