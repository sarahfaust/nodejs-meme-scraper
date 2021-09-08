const got = require('got');
const cheerio = require('cheerio');
const filesystem = require('node:fs');
const directory = './memes';

const downloadImage = async (index, imageLink) => {
  try {
    const fileName = `${directory}/img-${index}.jpg`;
    const downloadStream = got.stream(imageLink);
    const fileWriterStream = filesystem.createWriteStream(fileName);
    downloadStream.pipe(fileWriterStream);
    /*     // get image and fave it to response
    const response = await got(imageLink);
    // image will be stored at this path
    const path = `${directory}/img-${index}.jpg`;
    const filePath = filesystem.createWriteStream(path);
    response.pipe(filePath);
    filePath.on('finish', () => {
      filePath.close();
      console.log('file downloaded');
    }); */
  } catch (error) {
    console.log(error.response.body);
  }
};

const extractLinks = async (url) => {
  try {
    // fetch HTML
    const response = await got(url);
    const html = response.body;

    // use cheerio to extract <img> tags
    // this returns a mass object, not an array
    const $ = cheerio.load(html);
    const linkObjects = $('img');

    // collect the "src" of each link and add them to a new array
    const links = [];
    linkObjects.each((index, element) => {
      links.push($(element).attr('src'));
    });

    // loop through array
    for (let i = 0; i < 10; i++) {
      downloadImage(i, links[i]);
    }
  } catch (error) {
    console.log(error.response.body);
  }
};

const URL = 'https://memegen-link-examples-upleveled.netlify.app/';
extractLinks(URL);
