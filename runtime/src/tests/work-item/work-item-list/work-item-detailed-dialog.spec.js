/**
 * POC test for automated UI tests for Planner
 *  
 * Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 * 
 * beforeEach will set the mode to phone. Any tests requiring a different resolution will must set explicitly. 
 * 
 * @author ldimaggi
 */

var WorkItemListPage = require('./page-objects/work-item-list.page'),
  testSupport = require('./testSupport'),
  constants = require('./constants'),
  OpenShiftIoRHDLoginPage = require('./page-objects/openshift-io-RHD-login.page');

describe('Work item list', function () {
  var page, AUTH_TOKEN, REFRESH_TOKEN, until = protractor.ExpectedConditions;
  var waitTime = 30000;

  beforeEach(function () {
    browser.ignoreSynchronization = false;
    testSupport.setBrowserMode('desktop');
    if (AUTH_TOKEN && REFRESH_TOKEN){
      console.log("AUTH and REFRESH tokens found. Skipping login.")
      page = new WorkItemListPage(this.AUTH_TOKEN, this.REFRESH_TOKEN);
    } else {
      page = new WorkItemListPage()
    }
  });

  /* Simple test for registered user */
  it("should perform - LOGIN", function() {
    /* Login to SUT */
    page.clickLoginButton();
    browser.ignoreSynchronization = true;
    var RHDpage = new OpenShiftIoRHDLoginPage();
    RHDpage.doLogin(browser);
    browser.executeScript("return window.localStorage.getItem('auth_token');").then(function(val) {
      this.AUTH_TOKEN = val;
    });
    browser.executeScript("return window.localStorage.getItem('refresh_token');").then(function(val) {
      this.REFRESH_TOKEN = val
    });
  });

it('Create WorkItem and creatorname and image is relecting', function () {
  page.clickDetailedDialogButton();
  var detailPage = page.clickDetailedIcon("scenario");

  detailPage.clickWorkItemDetailTitle2();
  browser.wait(until.elementToBeClickable(detailPage.workItemDetailTitle), constants.WAIT, 'Failed to find workItemDetailTitle');   
  detailPage.setWorkItemDetailTitle (constants.NEW_WORK_ITEM_TITLE_2, false);
  detailPage.clickWorkItemTitleSaveIcon();

  detailPage.clickWorkItemDescriptionEditIcon2();
  detailPage.clickWorkItemDetailDescription();

  detailPage.setWorkItemDetailDescription (constants.WORK_ITEM_DESCRIPTION, true);
  detailPage.clickWorkItemDescriptionSaveIcon();

  expect(detailPage.getCreatorUsername()).toBe(constants.EXAMPLE_USER);
  expect(detailPage.getCreatorAvatar().isPresent()).toBe(true);     
  detailPage.clickWorkItemDetailFullPageCloseButton();

  /* TODO - Issue with mocking - workitems create thru detail page are not shown in workitem list 
    https://openshift.io/openshiftio/openshiftio/plan/detail/1581  */
//  browser.wait(until.presenceOf(page.workItemByTitle(workItemTitle)), waitTime, 'Failed to find workItemByTitle');
//  expect(page.workItemTitle(page.workItemByTitle(workItemTitle))).toBe(workItemTitle);
});

it('Edit and check WorkItem , creatorname and image is relecting', function () {
  page.clickDetailedDialogButton();
  var detailPage = page.clickDetailedIcon("fundamental");

  detailPage.clickWorkItemDetailTitle2();
  browser.wait(until.elementToBeClickable(detailPage.workItemDetailTitle), constants.WAIT, 'Failed to find workItemDetailTitle'); 
  detailPage.setWorkItemDetailTitle (constants.NEW_WORK_ITEM_TITLE_2, false);
  detailPage.clickWorkItemTitleSaveIcon();

  detailPage.clickWorkItemDescriptionEditIcon2();
  detailPage.clickWorkItemDetailDescription()

  detailPage.setWorkItemDetailDescription (constants.WORK_ITEM_DESCRIPTION, true);
  detailPage.clickWorkItemDescriptionSaveIcon();

  expect(detailPage.getCreatorUsername()).toBe(constants.EXAMPLE_USER);
  expect(detailPage.getCreatorAvatar().isPresent()).toBe(true);     
  detailPage.clickWorkItemDetailFullPageCloseButton();

  /* TODO - Issue with mocking - workitems create thru detail page are not shown in workitem list 
    https://openshift.io/openshiftio/openshiftio/plan/detail/1581  */
//  browser.wait(until.presenceOf(page.workItemByTitle(workItemTitle)), waitTime, 'Failed to find workItemList');
//  expect(page.workItemTitle(page.workItemByTitle(workItemTitle))).toBe(workItemTitle);
//  page.workItemViewId(page.firstWorkItem).getText().then(function (text) { 
//     page.clickWorkItemTitle(page.firstWorkItem, text);
//     browser.wait(until.textToBePresentInElement(detailPage.creatorUsername, 'Example User 0'), constants.WAIT, 'Failed to find creatorUsername');   
//     expect(detailPage.getCreatorUsername()).toBe('Example User 0');
//     expect(detailPage.getCreatorAvatar().isPresent()).toBe(true);  
//     expect(detailPage.getImageURL()).toBe('https://avatars.githubusercontent.com/u/2410471?v=3&s=20');
//  });
});

 it('check Creator is readonly - desktop', function () {
   page.clickDetailedDialogButton();
   var detailPage = page.clickDetailedIcon("bug");
   expect(detailPage.getCreatorUsername()).toBe(constants.EXAMPLE_USER);
   });
 /*  This test is blocked by : https://github.com/almighty/almighty-ui/issues/605 */
 it('check Creator is shown as loggedIn user - desktop', function () {
   page.clickDetailedDialogButton();
   var detailPage = page.clickDetailedIcon("bug");
   expect(detailPage.getCreatorAvatar().isPresent()).toBe(true); 
   expect(detailPage.getCreatorUsername()).toBe(constants.EXAMPLE_USER);
   });
 
/* Test commented out pending resolution of issue: https://github.com/almighty/almighty-ui/issues/538  */
 it('should create a new workitem through the detail dialog - phone.', function () {
   page.clickDetailedDialogButton();
   var detailPage = page.clickDetailedIcon("experience");

   detailPage.clickWorkItemDetailTitle2();
   browser.wait(until.elementToBeClickable(detailPage.workItemDetailTitle), constants.WAIT, 'Failed to find workItemDetailTitle'); 
   detailPage.setWorkItemDetailTitle (constants.NEW_WORK_ITEM_TITLE_2, false);
   detailPage.clickWorkItemTitleSaveIcon();
   
   detailPage.clickWorkItemDescriptionEditIcon2();
   detailPage.clickWorkItemDetailDescription()
   detailPage.setWorkItemDetailDescription (constants.WORK_ITEM_DESCRIPTION, true);
   detailPage.clickWorkItemDescriptionSaveIcon(); 
   detailPage.clickWorkItemDetailFullPageCloseButton();

  /* TODO - Issue with mocking - workitems create thru detail page are not shown in workitem list 
    https://openshift.io/openshiftio/openshiftio/plan/detail/1581  */
//   browser.wait(until.presenceOf(page.workItemByTitle(workItemTitle)), waitTime, 'Failed to find workItemList');
//   expect(page.workItemTitle(page.workItemByTitle(workItemTitle))).toBe(workItemTitle);
 });
  
});
