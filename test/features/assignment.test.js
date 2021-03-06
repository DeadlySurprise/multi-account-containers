const {initializeWithTab} = require("../common");

describe("Assignment Feature", function () {
  const url = "http://example.com";

  beforeEach(async function () {
    this.webExt = await initializeWithTab({
      cookieStoreId: "firefox-container-1",
      url
    });
  });

  afterEach(function () {
    this.webExt.destroy();
  });

  describe("click the 'Always open in' checkbox in the popup", function () {
    beforeEach(async function () {
      // popup click to set assignment for activeTab.url
      await this.webExt.popup.helper.clickElementById("container-page-assigned");
    });

    describe("open new Tab with the assigned URL in the default container", function () {
      let newTab;
      beforeEach(async function () {
        // new Tab opening activeTab.url in default container
        newTab = await this.webExt.background.browser.tabs._create({
          cookieStoreId: "firefox-default",
          url
        }, {
          options: {
            webRequestError: true // because request is canceled due to reopening
          }
        });
      });

      it("should open the confirm page", async function () {
        // should have created a new tab with the confirm page
        this.webExt.background.browser.tabs.create.should.have.been.calledWithMatch({
          url: "moz-extension://fake/confirm-page.html?" +
               `url=${encodeURIComponent(url)}` +
               `&cookieStoreId=${this.webExt.tab.cookieStoreId}`,
          cookieStoreId: undefined,
          openerTabId: null,
          index: 2,
          active: true
        });
      });

      it("should remove the new Tab that got opened in the default container", function () {
        this.webExt.background.browser.tabs.remove.should.have.been.calledWith(newTab.id);
      });
    });

    describe("click the 'Always open in' checkbox in the popup again", function () {
      beforeEach(async function () {
        // popup click to remove assignment for activeTab.url
        await this.webExt.popup.helper.clickElementById("container-page-assigned");
      });

      describe("open new Tab with the no longer assigned URL in the default container", function () {
        beforeEach(async function () {
          // new Tab opening activeTab.url in default container
          await this.webExt.background.browser.tabs._create({
            cookieStoreId: "firefox-default",
            url
          });
        });

        it("should not open the confirm page", async function () {
          // should not have created a new tab
          this.webExt.background.browser.tabs.create.should.not.have.been.called;
        });
      });
    });
  });
});
