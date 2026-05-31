const ethers = require("ethers")
const fs = require("fs")

const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/5896e8bc16534def929788608aaa7d3b')
const contractAddress = '0x56fd7C43fC463546d2aB8Bc11e9a88Af0cC3876b'
const ABI = [
    "function marquerPresence(uint256 idExam, uint etudiant)",
    "function verifierPresence(uint256 idExam, uint etudiant) view returns (uint8)"
]
const privateKey = '55b018eabb58b4be56464defbfa0925d92e9502fa23df880cb8a627acc84f7e4'
const signer = new ethers.Wallet(privateKey, provider)
const contract = new ethers.Contract(contractAddress, ABI, signer)


const marquerPresence = async (idExam, etudiant) => {
    const tx = await contract.marquerPresence(idExam, etudiant)
    const receipt = await tx.wait();
    const presence = await contract.verifierPresence(idExam, etudiant)
    if (presence) {
        console.log('presence marquee')
        return 1
    } else {
        console.log("presence a echouee")
        return 0
    }
}

const getEtudiants = () => {
    return fs.promises.readFile("public/BD/bd.json")
        .then(buffer => buffer.toString())
        .then(string => JSON.parse(string))
        .then(data => data.etudiants)
        .catch(e => console.log(e))
}

module.exports = {
    post: async (req, res) => {
        const idExam = req.body.idExam
        const etudiant = req.session.utilisateur
        try {
            if (await marquerPresence(idExam, etudiant)) {
                res.status(201).json({ msg:"Présence marquée avec succès" })
                res.end()
            } else {
                res.status(400).json({ msg:"Erreur, présence non marquée" })
                res.end()
            }
        } catch (e) {
            res.status(500).json({ msg:"erreur interne du serveur" })
            res.end()
            console.log(e)
        }
    },
    get: async (req, res) => {
        const idExam = req.query.idExam;
        if (!idExam) {
            return res.status(400).json({ error: "ID exam requis" });
        }
        return getEtudiants()
            .then(async etudiants => {
                let result = [];
                for (const etudiant of etudiants) {
                    const presence = await contract.verifierPresence(idExam, etudiant.id);
                    result.push({
                        etudiant: etudiant.username,
                        etat: presence > 0 ? "présent" : "absent"
                    });
                }
                res.json(result);
            })
            .catch(e => {
                console.error(e);
                res.status(500).json({ msg:"erreur interne du serveur" })
            })
    }
}