import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import puppeteer from 'puppeteer';

import { Dappeteer, RECOMMENDED_METAMASK_VERSION } from '../src';
import * as dappeteer from '../src/index';

import { pause } from './utils';

chaiUse(chaiAsPromised);

export let browser, metamask: Dappeteer, testPage;

describe('dappeteer', () => {
  before(async () => {
    browser = await dappeteer.launch(puppeteer, {
      metamaskVersion: process.env.METAMASK_VERSION || RECOMMENDED_METAMASK_VERSION,
    });

    testPage = await browser.newPage();

    await testPage.setViewport({ width: 1366, height: 768 });
    await testPage.goto('http://localhost:3001/boost');
  });

  it('should running, puppeteer', async () => {
    expect(browser).to.be.ok;
  });

  it('should open, test page', async () => {
    expect(testPage).to.be.ok;
    expect(await testPage.title()).to.be.equal('Key Finance');
  });

  it('should data loaded', async () => {
    await testPage.bringToFront();
    await pause(1);
    // await testPage.goto('http://localhost:3001/boost');
    const badge = await testPage.waitForSelector('.badges');
    expect(badge).to.be.ok;
  });
});
