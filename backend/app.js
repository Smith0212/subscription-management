const m = require('./language/en')
const express = require('express')
require('dotenv').config();
const app_routing = require('./modules/app_routing');
const middleware = require('./middleware/validators');
const bodyParser = require('body-parser');

const app = express();

app.post('/v1/payment/webhook', bodyParser.raw({ type: 'application/json' }),
    (req, res, next) => {
        console.log("wwwwwwwwwebhook received!");
        // console.log("Headers:", JSON.stringify(req.headers));
        // console.log("Signature:", req.headers['stripe-signature']);
        next();
    });

const cookieParser = require('cookie-parser');
app.use(cookieParser());


const cors = require('cors');


app.use(cors({
    origin: [
        'https://subscription-management-q1kn.vercel.app', // your frontend production URL
        'http://localhost:3001' // for local testing
    ],
}));

app.options('*', cors());



// app.use(express.json());
app.use(express.text());

// extracting language from header
app.use('/', middleware.extractHeaderLanguage);
// app.use('/',middleware.validateApiKey);
app.use('/', middleware.validateHeaderToken);

app_routing.v1(app);


const port = process.env.port || 26450;
app.listen(port, () => {
    console.log("Server running on port :", port);
});

// api documentation
// https://documenter.getpostman.com/view/33413814/2sAYkDNgGf






