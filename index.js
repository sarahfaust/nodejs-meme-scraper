const got = require('got');
const cheerio = require('cheerio');
const fs = require('node:fs');

const directory = './memes';

const topText = process.argv[2];
const bottomText = process.argv[3];
const memeImage = process.argv[4];

const downloadImage = async (index, imageLink) => {
  try {
    const fileName = `${directory}/img-${index}.jpg`;

    // use got to create stream (instead of saving respose)
    const downloadStream = await got.stream(imageLink);
    const fileWriterStream = fs.createWriteStream(fileName);
    downloadStream.pipe(fileWriterStream);
  } catch (error) {
    console.log(error.response.body);
  }
};

const getCustomImage = async (top, bottom, image) => {
  try {
    const fileName = `${directory}/img-${top}-${bottom}-${image}.jpg`;
    const imageLink = `https://api.memegen.link/images/${image}/${top}/${bottom}.jpg`;

    console.log(imageLink);

    // use got to create stream (instead of saving response)
    const downloadStream = await got.stream(imageLink);
    const fileWriterStream = fs.createWriteStream(fileName);
    downloadStream.pipe(fileWriterStream);
  } catch (error) {
    if (error.response.body) {
      console.log(error.response.body);
    } else {
      console.error();
      process.exit(1);
    }
  }
};

const getRandomImages = async (url) => {
  try {
    // fetch HTML
    const response = await got(url);
    const html = response.body;

    // use cheerio to extract <img> tags
    // this returns a mass object, not an array
    const $ = cheerio.load(html);
    const linkStringList = $('img');

    // collect the "src" of each link and add them to a new array
    const imageLinkList = [];
    linkStringList.each((index, element) => {
      imageLinkList.push($(element).attr('src'));
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
      downloadImage(i, imageLinkList[i]);

      // track progress
      const progress = '#####';
      progressBar = progressBar.concat(progress);
      waitBar = waitBar.slice(5);
      percent = (i + 1) * 10;
      const consoleMessage = `Downloading images: |${progressBar}${waitBar}| ${percent}%`;

      // clear sdtout and print current message
      setTimeout(() => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(consoleMessage);
      }, 200 * i);
    }

    setTimeout(() => {
      console.log('\nDownload finished!');
    }, 2000);
  } catch (error) {
    if (error.response.body) {
      console.log(error.response.body);
    } else {
      console.error();
      process.exit(1);
    }
  }
};

if (topText && bottomText && memeImage) {
  getCustomImage(topText, bottomText, memeImage);
} else {
  getRandomImages('https://memegen-link-examples-upleveled.netlify.app/');
}
