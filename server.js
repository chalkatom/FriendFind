const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const port = process.env.PORT || 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    name: process.env.SESSION_NAME || 'sessionId',
}));


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
    interest1: { type: String, default: '' },
    interest2: { type: String, default: '' },
    interest3: { type: String, default: '' },
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
    fR: { type: [mongoose.Schema.Types.ObjectId], default: [] } //friend requests
});

const Users = mongoose.model("data", userSchema)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'FFmainpage.html'))
})

app.post('/post', async (req, res) => {
    const { name, pronoun } = req.body
    const user = new Users({
        name,
        pronoun
    })
    try {
        await user.save()
        console.log(user)

        req.session.currentUserId = user._id;

        res.redirect(`FFInterestPage.html?currentUserId=${user._id}`)
    } catch(error) {
        console.log(error)
        res.send("Form Submission Failed")
    }
})

app.post('/submitAnswers', async (req, res) => {
    console.log(req.body);

    const { interest1, question1, answer1, wrong1a, wrong1b, wrong1c, interest2, question2, answer2, wrong2a, wrong2b, wrong2c, interest3, question3, answer3, wrong3a, wrong3b, wrong3c } = req.body;
    const currentUserId = req.session.currentUserId;

    try {
        const user = await Users.findById(currentUserId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        if (!interest1 || !interest2 || !interest3) {
            return res.status(400).send("Missing interests in form");
        }

        user.interest1 = interest1;
        user.question1 = question1;
        user.answer1 = answer1;
        user.wrong1a = wrong1a;
        user.wrong1b = wrong1b;
        user.wrong1c = wrong1c;
        user.interest2 = interest2;
        user.question2 = question2;
        user.answer2 = answer2;
        user.wrong2a = wrong2a;
        user.wrong2b = wrong2b;
        user.wrong2c = wrong2c;
        user.interest3 = interest3;
        user.question3 = question3;
        user.answer3 = answer3;
        user.wrong3a = wrong3a;
        user.wrong3b = wrong3b;
        user.wrong3c = wrong3c;

        await user.save()

        res.redirect(`/showuser?currentUserId=${currentUserId}`);
    } catch(err) {
        console.log(err)
        res.status(500).send("Failed to submit answers");
    }
});

app.get('/showuser', async (req, res) => {
    const currentUserId = req.session.currentUserId;

    try {
        const currentUser = await Users.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).send("Current user not found.");
        }

        // Check if there are friend requests
        if (currentUser.fR.length > 0) {
            const otherUsers = await Users.find({ _id: { $ne: currentUserId } });
            // Check for mutual friend requests
            for (const otherUser of otherUsers) {
                if (currentUser.fR.includes(otherUser._id) && otherUser.fR.includes(currentUserId)) {
                    return res.redirect('/matchpage');
                }
            }
        }

        // Find random user (excluding the current user)
        const otherUsers = await Users.find({ _id: { $ne: currentUserId } }); // Ensure this line is here
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];

        // Render HTML page with loading screen, then show the user
        res.send(`
            <html>
                <head>
                    <title>FriendFind</title>
                    <link rel="stylesheet" type="text/css" href="styles.css">
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                document.getElementById('loading').style.display = 'none';
                                document.getElementById('user-info').style.display = 'block';
                            }, 2000);
                        };
                    </script>
                    <style>
                        #user-info { display: none; }
                        #loading { font-size: 24px; font-weight: bold; text-align: center; padding: 20px; }
                    </style>
                </head>
                <body>
                    <div id="loading">Looking for Friend...</div>
                    <div id="user-info">
                        <center>
                            <h1>FriendFind</h1>
                            <h2>Meet ${randomUser.name}!</h2>
                            <p>Pronouns: ${randomUser.pronoun}</p>
                            <p>Interests: ${randomUser.interest1}, ${randomUser.interest2}, ${randomUser.interest3}</p>
                            <h2>Questions:</h2>
                            <button class="question-button" onclick="window.location.href='/question?question=${encodeURIComponent(randomUser.question1)}&correctAnswer=${encodeURIComponent(randomUser.answer1)}&wrongAnswer1=${encodeURIComponent(randomUser.wrong1a)}&wrongAnswer2=${encodeURIComponent(randomUser.wrong1b)}&wrongAnswer3=${encodeURIComponent(randomUser.wrong1c)}'">${randomUser.question1}</button>
                            <br>
                            <button class="question-button" onclick="window.location.href='/question?question=${encodeURIComponent(randomUser.question2)}&correctAnswer=${encodeURIComponent(randomUser.answer2)}&wrongAnswer1=${encodeURIComponent(randomUser.wrong2a)}&wrongAnswer2=${encodeURIComponent(randomUser.wrong2b)}&wrongAnswer3=${encodeURIComponent(randomUser.wrong2c)}'">${randomUser.question2}</button>
                            <br>
                            <button class="question-button" onclick="window.location.href='/question?question=${encodeURIComponent(randomUser.question3)}&correctAnswer=${encodeURIComponent(randomUser.answer3)}&wrongAnswer1=${encodeURIComponent(randomUser.wrong3a)}&wrongAnswer2=${encodeURIComponent(randomUser.wrong3b)}&wrongAnswer3=${encodeURIComponent(randomUser.wrong3c)}'">${randomUser.question3}</button>
                        </center>
                    </div>
                </body>
            </html>
        `);
    } catch (err) {
        console.error(err); // Log the error to console for debugging
        res.status(500).send("Error finding users");
    }
});


app.get('/question', (req, res) => {
    const question = req.query.question;
    const correctAnswer = req.query.correctAnswer;
    const wrongAnswer1 = req.query.wrongAnswer1;
    const wrongAnswer2 = req.query.wrongAnswer2;
    const wrongAnswer3 = req.query.wrongAnswer3;

    // Save the otherUserId to the session
    req.session.otherUserId = req.query.otherUserId;

    // Render the question page with dynamic data
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Question Detail</title>
            <link rel="stylesheet" type="text/css" href="styles.css">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    text-align: center;
                }
                .answer {
                    margin-top: 20px;
                    font-size: 18px;
                    font-weight: bold;
                }
                button {
                    display: block;
                    margin: 10px auto;
                    padding: 10px 20px;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h1>FriendFind</h1>
            <h2 id="question"></h2>
            
            <div id="buttons"></div> <!-- Container for buttons -->

            <script>
                //get parameters from url
                const urlParams = new URLSearchParams(window.location.search);
                const question = urlParams.get('question');
                const correctAnswer = urlParams.get('correctAnswer');
                const wrongAnswers = [
                    urlParams.get('wrongAnswer1'),
                    urlParams.get('wrongAnswer2'),
                    urlParams.get('wrongAnswer3')
                ];

                //add question and answers to page
                document.getElementById('question').textContent = question;

                //create buttons for answers
                const buttonsDiv = document.getElementById('buttons');
                buttonsDiv.innerHTML = ''; // Clear any existing content

                //function to handle answer click
                function handleAnswerClick(answer) {
                    const otherUserId = "${req.session.otherUserId}"; // Retrieve from session
                    if (answer === correctAnswer) {
                        // Redirect to the correct answer page
                        window.location.href = '/correct-answer?otherUserId=' + otherUserId; // Change to your correct answer page URL
                    } else {
                        // Redirect to the wrong answer page
                        window.location.href = '/wrong-answer'; // Change to your wrong answer page URL
                    }
                }

                //create buttons for each answer
                const answers = [correctAnswer, ...wrongAnswers];
                answers.forEach(answer => {
                    const button = document.createElement('button');
                    button.textContent = answer;
                    button.onclick = () => handleAnswerClick(answer); // Add click event handler
                    buttonsDiv.appendChild(button);
                });
            </script>
        </body>
        </html>
    `);
});


app.get('/correct-answer', async (req, res) => {
    const currentUserId = req.session.currentUserId;
    const otherUserId = req.session.otherUserId; // Get from session

    try {
        await Users.findByIdAndUpdate(currentUserId, { $addToSet: { fR: otherUserId } });
    
        res.send(`
            <html>
                <head>
                    <title>Correct Answer</title>
                    <link rel="stylesheet" type="text/css" href="styles.css">
                </head>
                <body>
                <center>
                    <h1>FriendFind</h1>
                    <h2>Found Friend!</h2>
                    <h3>Request Sent</h3>
                    <button onclick="window.location.href='/showuser'">Find Another Friend</button>
                </center>
                </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error processing correct answer");
    }
});




app.get('/wrong-answer', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Wrong Answer</title>
                <link rel="stylesheet" type="text/css" href="styles.css">
            </head>
            <body>
            <center>
                <h1>FriendFind</h1>
                <h2>Sorry! Wrong Answer...</h2>
                <button onclick="window.history.back()">Try New Question?</button><br>
                <button onclick="window.location.href='/showuser'">Find Another Friend?</button>
            </center>
            </body>
        </html>
    `);
});

app.get('/matchpage', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Match Page</title>
                <link rel="stylesheet" type="text/css" href="styles.css">
            </head>
            <body>
            <center>
                <h1>FriendFind</h1>
                <h2>It's a Match!</h2>
                <button onclick="window.location.href='/showuser'">Find Another Friend</button>
            </center>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log("Server Started");
});
