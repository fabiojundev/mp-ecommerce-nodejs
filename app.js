var express = require('express');
var exphbs  = require('express-handlebars');
const nocache = require('nocache');
const bodyParser = require('body-parser');

var mercadopago = require('mercadopago');
const appUrl = 'https://fabiojundev-mp-commerce-nodejs.appUrl.com'

require('dotenv').config();
// console.log(process.env);

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
});

var port = process.env.PORT || 3000

var app = express();
app.use(nocache());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});


app.post('/checkout', function (req, res) {
    console.log("checkout", req);

    let preference = {
        notification_url : appUrl + "/ipn",
        external_reference : "fabiojundev@gmail.com",
        auto_return : 'approved',
        back_urls : {
            success : appUrl + '/callback?status=success',
            pending : appUrl + '/callback?status=pending',
            failure : appUrl + '/callback??status=failure',
        },
        payer : {
            name : 'Lalo',
            surname : 'Landa',
            email : 'test_user_92801501@testuser.com',
            phone : {
                area_code : '55',
                number : 985298743,
            },
            address : {
                zipcode : '78134190',
                street_name : 'Insurgentes Sur',
                street_number : 1602,
            }
        },
        payment_methods : {
            installments : 6,
            excluded_payment_methods : [{id : "amex"}],
            excluded_payment_types : [{id : "atm"}],
        },
        items: [{
            id: 1234,
            description : "Celular de Tienda e-commerce",
            title: req.body.title,
            unit_price: Number(req.body.price),
            image : req.body.image,
            quantity: 1
        }]
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {
            // global.id = response.body.id;
            console.log("response", {
                init_point : response.body.init_point,
                preference_id : response.body.id,
                mp_public_key: process.env.MP_PUBLIC_KEY,
            });
            res.render('checkout', {
                init_point : response.body.init_point,
                preference_id : response.body.id,
                mp_public_key: process.env.MP_PUBLIC_KEY,
            });
        }).catch(function (error) {
            console.log(error);
            res.send('Erro ao criar preferência.');
        });
});


app.post('/ipn', function (req, res) {
    console.log('IPN', req.body);
    res.send(req.body);
});

app.get('/404', function (req, res) {
    return res.send('Not found');
});

app.listen(port);