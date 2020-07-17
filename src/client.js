const puppeteer = require('puppeteer');


const adicionarAta = async (description, participants) => {
    const browser = await puppeteer.launch({headless: true, 
        defaultViewport: null});
    const pages = await browser.pages();
    const firstPage = pages[0];
    await firstPage.goto('https://txm.business/login', { waitUntil: 'networkidle2'});
    // await firstPage.$eval('div[class="field"] > div[class="control"] > input[type="email"]', els => {
    //     firstPage.type(els, 'assav');
    // });
    await firstPage.type('div[class="field"] > div[class="control"] > input[type="email"]', 'assav')
    await firstPage.type('div[class="field"] > div[class="control"] > input[type="password"]', 'assav007');
    await firstPage.$eval('div[class="field is-grouped is-grouped-centered"] > div[class="control"] > button[class="entre my-button button"]', el => {
        el.click();
    });
    await firstPage.waitForNavigation();
    await firstPage.goto('https://txm.business/profile/mentorias', { waitUntil: 'networkidle2'});
    await firstPage.waitForSelector('#ata');
    await firstPage.type('#ata', description);
    await firstPage.type('input[name="participants"]', participants);
    await firstPage.$eval('a[class="button my-button v-button"]', button => {
        button.click();
    });
}


module.exports = {
    adicionarAta
};