const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3019

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }))


mongoose.connect('mongodb+srv://adamchakour05:C5ygFeBcxpPDaNg2@ffcluster.8ojuf.mongodb.net/FFdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.once('open', () => {
    console.log("Connected to MongoDB")
})

const userSchema = new mongoose.Schema({
    name: String,
    pronoun: {
        type: String,
        enum: ['he/him', 'she/her', 'they/them'],
    },
    interest1: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    interest2: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    interest3: {
        type: String,
        enum: ['Movies', 'TV', 'Video Games', 'Books', 'Music', 'Travel', 'Cooking'],
    },
    question1: { type: String, default: '' },
    answer1: { type: String, default: '' },
    wrong1a: { type: String, default: '' },
    wrong1b: { type: String, default: '' },
    wrong1c: { type: String, default: '' },
    question2: { type: String, default: '' },
    answer2: { type: String, default: '' },
    wrong2a: { type: String, default: '' },
    wrong2b: { type: String, default: '' },
    wrong2c: { type: String, default: '' },
    question3: { type: String, default: '' },
    answer3: { type: String, default: '' },
    wrong3a: { type: String, default: '' },
    wrong3b: { type: String, default: '' },
    wrong3c: { type: String, default: '' },
});

const Users = mongoose.model("data", userSchema)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FFmainpage.html'))
})

app.post('/post', async (req, res) => {
    const { name, pronoun, interest1, interest2, interest3 } = req.body
    const user = new Users({
        name,
        pronoun,
        interest1,
        interest2,
        interest3
    })
    try {
        await user.save()
        console.log(user)
        res.redirect(`/showuser?currentUserId=${user._id}`)
    } catch(error) {
        console.log(error)
        res.send("Form Submission Failed")
    }
})

app.get('/showuser', async (req, res) => {
    const currentUserId = req.query.currentUserId;

    try {
        //find random user (excluding the current user)
        const otherUsers = await Users.find({ _id: { $ne: currentUserId } });

        if (otherUsers.length > 0) {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            //render html page with loading screen, then show the user
            res.send(`
                <html>
                    <head>
                        <title>FriendFind</title>
                        <script>
                            window.onload = function() {
                                //display loading screen for 2 seconds, then show user info
                                setTimeout(function() {
                                    document.getElementById('loading').style.display = 'none';
                                    document.getElementById('user-info').style.display = 'block';
                                }, 2000);
                            };
                        </script>
                        <style>
                            #user-info {
                                display: none; /*hide user info at start*/
                            }
                            #loading {
                                font-size: 24px;
                                font-weight: bold;
                                text-align: center;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="loading">Loading...</div>
            
                        <div id="user-info">
                            <h1>Meet ${randomUser.name}!</h1>
                            <p>Pronouns: ${randomUser.pronoun}</p>
                            <p>Interests: ${randomUser.interest1}, ${randomUser.interest2}, ${randomUser.interest3}</p>
                        </div>
                    </body>
                </html>
            `);
        } else {
            res.send("No other users found.");
        }
    } catch (err) {
        res.status(500).send("Error finding users");
    }
});

app.listen(port, () => {
    console.log("Server Started")
})
