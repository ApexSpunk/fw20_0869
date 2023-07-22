const express = require('express');
const axios = require('axios');
const PORT = 3000;

const app = express();
app.use(express.json());

const checkTimeout = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Timeout');
        }, ms);
    });
};

const fetchData = async (url) => {
    console.log(`Fetching data from ${url}`);
    try {
        const response = await axios.get(url);
        const numbersArray = response.data.numbers;
        return numbersArray;
    } catch (error) {
        console.error(error);
        return [];
    }
};

app.get('/', (req, res) => {
    res.send({ message: 'API is running' });
});

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;
    const timeout = 500;

    try {
        const promises = urls.map(fetchData);

        const responses = await Promise.race([Promise.all(promises), checkTimeout(timeout)]);

        const integers = responses.reduce((acc, response) => {
            // console.log('response', response);
            response.forEach((number) => acc.push(number));
            return acc;
        }, []);

        const sortedUniqueIntegers = [...new Set(integers)].sort((a, b) => a - b);

        res.json({ numbers: sortedUniqueIntegers });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
