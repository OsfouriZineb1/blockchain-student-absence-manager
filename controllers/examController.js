const fs = require('fs');
const path = "public/BD/bdexam.json";

const loadExams = () => {
    return fs.promises.readFile(path)
        .then(buffer => JSON.parse(buffer.toString()))
        .then(data => data.exams)
        .catch((e) => console.error(e))
}

const saveExam = (exam) => {
    return loadExams()
        .then(exams => {
            exams.push(exam)
            return exams
        }).then(tab => {
            return fs.promises.writeFile(path, JSON.stringify({ exams: tab }, null, 3));
        }).catch(e => console.error(e))
}
const deleteExam = (examId) => {
    return loadExams()
        .then(exams => {
            const updatedExams = exams.filter(exam => exam.id !== examId);
            return updatedExams;
        })
        .then(updatedExams => {
            return fs.promises.writeFile(path, JSON.stringify({ exams: updatedExams }, null, 3));
        })
        .catch(e => console.error(e));
}
module.exports = {
    post: async (req, res) => {
        const { nom, date, id } = req.body;
        if (!nom || !date) {
            return res.status(400).json({ msg: "Nom et date obligatoires" })
        }
        const newExam = { id, nom, date }
        saveExam(newExam)
        .then(resultat => {
            return res.status(201).json({ msg: "exam ajoutee avec succes" })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ msg: "Erreur interne du serveur" })
        })
    },
    get: (req, res) => {
        loadExams()
            .then(exams => {
                if (exams) {
                   return res.status(200).json({ exams })
                } else {
                    return res.status(400).json({ msg: "aucun exam disponible" })
                }
            }).catch(err => {
                console.error(err)
                return res.status(500).json({ msg: "erreur interne du serveur" })
            })
    },
    delete: (req, res) => {
        try {
            const { idExam } = req.body
            if (!idExam) {
                return res.status(400).json({ msg: "ID de l'examen est obligatoire" });
            }
            deleteExam(idExam)
                .then(result => res.status(200).json({ msg: "Examen supprimé avec succès" }))
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ msg: "Erreur interne du serveur" })
                })
        }
        catch (err) {
            console.error(err)
            return res.status(500).json({ msg: "Erreur interne du serveur" })
        }
    }
}