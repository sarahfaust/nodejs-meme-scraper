const got = require('got');
const cheerio = require('cheerio');
const filesystem = require('node:fs');

const directory = './memes';
const URL = 'https://memegen-link-examples-upleveled.netlify.app/';

const topText = process.argv[2];
const bottomText = process.argv[3];
const memeImage = process.argv[4];

const downloadImage = async (index, imageLink) => {
  try {
    const fileName = `${directory}/img-${index}.jpg`;

    // use got to create stream (instead of saving respose)
    const downloadStream = got.stream(imageLink);
    const fileWriterStream = filesystem.createWriteStream(fileName);
    downloadStream.pipe(fileWriterStream);
  } catch (error) {
    console.log(error.response.body);
  }
};

const getCustomImage = async (top, bottom, image) => {
  try {
    const fileName = `${directory}/img-${top}-${bottom}-${image}.jpg`;
    const imageLink = `https://api.memegen.link/images/${memeImage}/${topText}/${bottomText}.jpg`;

    console.log(imageLink);

    // use got to create stream (instead of saving response)
    const downloadStream = got.stream(imageLink);
    const fileWriterStream = filesystem.createWriteStream(fileName);
    downloadStream.pipe(fileWriterStream);
  } catch (error) {
    console.log(error.response.body);
  }
};

const writeToConsole = (message) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

const getRandomImages = async (url) => {
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

    // define variables for progress bar
    let percent = 0;
    let progressBar = '';
    let waitBar = '';

    for (let i = 0; i < 50; i++) {
      waitBar = waitBar.concat('-');
    }

    // log initial progress bar
    process.stdout.write(
      `Downloading images: |${progressBar}${waitBar}| ${percent}%`,
    );

    // loop through link array
    for (let i = 0; i < 10; i++) {
      downloadImage(i, links[i]);

      // track progress
      const progress = '#####';
      progressBar = progressBar.concat(progress);
      waitBar = waitBar.slice(5);
      percent = (i + 1) * 10;
      const consoleMessage = `Downloading images: |${progressBar}${waitBar}| ${percent}%`;

      // clear sdtout and print current message
      setTimeout(() => writeToConsole(consoleMessage), 500 * i);
    }
  } catch (error) {
    console.log(error.response.body);
  }
};

if (topText && bottomText && memeImage) {
  getCustomImage(topText, bottomText, memeImage);
} else {
  getRandomImages(URL);
}
