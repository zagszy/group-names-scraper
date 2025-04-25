import puppeteer from 'puppeteer';

export async function launchBrowser() {
    return await puppeteer.launch({ headless: false });
}