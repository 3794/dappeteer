import { readdir } from 'fs/promises';
import path from 'path';

import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import puppeteer from 'puppeteer';

import { Dappeteer, RECOMMENDED_METAMASK_VERSION } from '../src';
import * as dappeteer from '../src/index';

import { pause } from './utils';

chaiUse(chaiAsPromised);

async function clickElement(page, elementType, escapedText): Promise<void> {
  await page.bringToFront();

  const xpath = `//${elementType}[text()[contains(., ${escapedText})]]`;
  await page.waitForXPath(xpath);

  // await page.waitForSelector(selector);
  const element = await page.$x(xpath);
  await element.click();
}

export let testContract, browser, metamask: Dappeteer, testPage;

describe('dappeteer', () => {
  before(async () => {
    browser = await dappeteer.launch(puppeteer, {
      metamaskVersion: process.env.METAMASK_VERSION || RECOMMENDED_METAMASK_VERSION,
    });
    metamask = await dappeteer.setupMetamask(browser, {
      // optional, else it will use a default seed
      seed: 'pioneer casual canoe gorilla embrace width fiction bounce spy exhibit another dog',
      password: 'password1234',
    });
    testPage = await browser.newPage();

    await testPage.setViewport({ width: 1366, height: 768 });
    await testPage.goto('http://localhost:3001/boost');

    // output version
    const directory = path.resolve(__dirname, '..', 'metamask');
    const files = await readdir(directory);
    console.log(`::set-output name=version::${files.pop().replace(/_/g, '.')}`);
  });

  it('should running, puppeteer', async () => {
    expect(browser).to.be.ok;
  });

  it('should open, metamask', async () => {
    expect(metamask).to.be.ok;
  });

  it('should open, test page', async () => {
    expect(testPage).to.be.ok;
    expect(await testPage.title()).to.be.equal('Key Finance');
  });

  it('should add network with required params', async () => {
    await pause(0.5);
    await metamask.addNetwork({
      networkName: 'Klaytn Testnet Baobab',
      rpc: 'https://api.baobab.klaytn.net:8651',
      chainId: 1001,
      symbol: 'KLAY',
    });
    await pause(0.5);
    const selectedNetwork = await metamask.page.evaluate(
      () => (document.querySelector('.network-display > span:nth-child(2)') as HTMLSpanElement).innerHTML,
    );
    expect(selectedNetwork).to.be.equal('Klaytn Testnet Baobab');
  });

  it('should switch network', async () => {
    await metamask.switchNetwork('Klaytn Testnet Baobab');
    await pause(0.5);
  });

  it('should data loaded', async () => {
    await testPage.bringToFront();
    await testPage.goto('http://localhost:3001/boost');
    await pause(5);
    const badges = await testPage.waitForSelector('.badges');
    expect(badges).to.be.ok;

    // await clickElement(testPage, 'button', '"Connect Wallet"');
    // await pause(10);
  });

  // describe('test importPK method', importPKTests.bind(this));

  // TODO: cover more cases
  // it('should add token', async () => {
  //   await metamask.switchNetwork('kovan');
  //   await metamask.addToken({
  //     tokenAddress: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
  //     symbol: 'KAKI',
  //   });
  //   await metamask.switchNetwork('localhost');
  // });

  // after(async () => {
  //   // close browser
  //   await browser.close();
  // });
});
