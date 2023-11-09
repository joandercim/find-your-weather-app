const express = require('express');
const path = require('path');
const fetch = require('node-fetch')

const port = 3000;
const app = express();

app.use(express.static('dist'));

app.get('/weather/:lng/:lat', async (req, res) => {
    try {
        const apiResponse = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${req.params.lng}/lat/${req.params.lat}/data.json`);
        const weatherData = await apiResponse.json();
        res.json({ success: true, data: weatherData });
        
    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log('App listening on ' + port);
})