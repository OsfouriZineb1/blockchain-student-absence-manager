const fs = require('fs');
const { disconnect } = require('process');
const path = "public/BD/bdexam.json";

const loadDatabase = () => {
    return fs.promises.readFile("public/BD/bd.json")
        .then(buffer => buffer.toString())
        .then(string => JSON.parse(string))
        .then(data => data.etudiants)
        .catch(e => console.log(e))
}

const loadExams = () => {
    return fs.promises.readFile(path)
        .then(buffer => JSON.parse(buffer.toString()))
        .then(data => data.exams)
        .catch((e) => console.error(e))
}

const verifierUtilisateur = (email, password) => {
    return loadDatabase().then(etudiants => {
        const utilisateur = etudiants.find(user => user.email === email);
        if (!utilisateur) {
            return -1;
        }
        if (utilisateur.mdp !== password) {
            return 0;
        }
        return 1;
    })
};

const verifierExamenDuJour = () => {
    const aujourdHui = new Date().toISOString().split('T')[0]; // Date au format YYYY-MM-DD
    return loadExams()
        .then(exams => {
            const examenDuJour = exams.find(exam => exam.date === aujourdHui);
            if (examenDuJour) {
                return 1
            } else {
                return 0
            }
        })
        .catch(e => {
            console.error("Erreur lors de la vérification des examens :", e);
        });
}

const userId = async (email) => {
    return loadDatabase()
        .then(etudiants => {
            let utilisateur = etudiants.find(user => user.email === email);
            return utilisateur.id
        })
}

module.exports = {
    get: (req, res) => {
        let utilisateur
        let exam
        if (!req.session.utilisateur || req.session.utilsateur == "") {
            utilisateur = ""
            exam = 0
            req.session.destroy()
        } else {
            utilisateur = req.session.utilisateur
            exam = req.session.exam
        }
        res.render("index.ejs", { utilisateur, exam })
    }
    ,
    post: (req, res) => {
        let mail = req.body.mail
        let mdp = req.body.mdp
        let disconnect = req.body.disconnect
        if (disconnect) {
            req.session.utilisateur = ""
            return res.redirect("/")
        }
        else {
            verifierUtilisateur(mail, mdp)
                .then(result => {
                    if (result == -1) {
                        return res.status(404).json({ msg: "Utilisateur non trouvé" });
                    } else if (result) {
                        userId(mail)
                            .then(async userId => {
                                req.session.utilisateur = userId
                                verifierExamenDuJour()
                                    .then(result => {
                                        if (result) {
                                            req.session.exam = 1
                                        } else {
                                            req.session.exam = 0
                                        }
                                        return res.redirect("/")
                                    }).catch(err => {
                                        console.error(err)
                                        return res.status(500).json({ msg: "erreur interne du serveur" });
                                    })

                            }).catch(err => {
                                console.error(err)
                                return res.status(500).json({ msg: "erreur interne du serveur" });
                            })
                    } else {
                        return res.status(401).json({ msg: "Mot de passe incorrect" });
                    }
                }).catch(e => {
                    console.error(e)
                    return res.status(500).json({ msg: "erreur interne du serveur" });
                })
        }
    }
}