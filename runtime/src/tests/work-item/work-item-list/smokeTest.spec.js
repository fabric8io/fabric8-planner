/**
 * POC test for automated UI tests for Planner
 *  Story: Display and Update Work Item Details
 *  https://github.com/almighty/almighty-core/issues/298
 *
 * Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 *
 * beforeEach will set the mode to phone. Any tests requiring a different resolution will must set explicitly.
 *
 * @author naina-verma, rgarg@redhat.com
 */

var WorkItemListPage = require('./page-objects/work-item-list.page'),
  OpenShiftIoRHDLoginPage = require('./page-objects/openshift-io-RHD-login.page'),
  testSupport = require('./testSupport'),
  constants = require('./constants');

describe('Work item list', function () {
  var page, items, browserMode;

  var until = protractor.ExpectedConditions;
  var WORK_ITEM_TITLE = "The test workitem title";
  var WORK_ITEM_UPDATED_TITLE = "The test workitem title - UPDATED";
  var WORK_ITEM_DESCRIPTION = "The test workitem description";
  var WORK_ITEM_UPDATED_DESCRIPTION = "The test workitem description - UPDATED";
  var EXAMPLE_USER_0 = "Ruchir Garg";
  var EXAMPLE_USER_1 = "Example User 1";
  var MOCK_WORKITEM_TITLE_0 = "Title Text 0";
  var WORKITEM_0_ID = 'id0';
  var WORKITEM_1_ID = 'id1';
  var AREA_0_TITLE = '/Root Area/Area 0';
  var AREA_1_TITLE = '/Root Area/Area 1';
  var newLabelTitle = "My Test Label";
  var testLabelTitle = "Example Label 0";

  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    browser.ignoreSynchronization = false;
    page = new WorkItemListPage(true);
  });

  // This test is obsolete as we use token for login
  // /* Simple test for registered user */
  // it("should perform - LOGIN", function() {
  //   browser.ignoreSynchronization = true;
  //   jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000000;   /* 10 minutes */
  //   console.log ("Login test for target URL: " + browser.params.target.url);
  //   /* Login to SUT */
  //   page.clicklocalLoginButton();
  //   var RHDpage = new OpenShiftIoRHDLoginPage();
  //   RHDpage.doLogin(browser);
  // });

  /* User can read, update, remove assignee on a workitem  */
  it('User can read, update, remove assignee', function() {
    page.clickWorkItemQuickAdd();
    page.typeQuickAddWorkItemTitle(WORK_ITEM_TITLE);
    page.clickQuickAddSave().then(function() {
      var detailPage = page.clickWorkItemTitle(WORK_ITEM_TITLE);
      browser.wait(until.elementToBeClickable(detailPage.workItemDetailAssigneeIcon), constants.WAIT, 'Failed to find Assignee Icon');
      detailPage.clickworkItemDetailAssigneeIcon();
      detailPage.setWorkItemDetailAssigneeSearch(EXAMPLE_USER_1, false);
      detailPage.clickAssignedUserDropDownList(EXAMPLE_USER_1);
      expect(detailPage.details_assigned_user().getText()).toContain(EXAMPLE_USER_1);
      detailPage.details_assigned_user().click();
      detailPage.clickworkItemDetailUnassignButton();
      expect(detailPage.workItemDetailAssigneeNameClickable().getText()).toBe('Unassigned');
      detailPage.clickWorkItemDetailCloseButton();
    });
  });

  /* Create a new workitem, fill in the details, save, retrieve, update, save, verify updates are saved */
  it('should find and update the workitem through its detail page', function() {
    /* Create a new workitem */
    page.clickWorkItemQuickAdd();
    page.typeQuickAddWorkItemTitle(WORK_ITEM_TITLE);
    page.typeQuickAddWorkItemDesc(WORK_ITEM_DESCRIPTION);
    page.clickQuickAddSave().then(function() {
      expect(page.workItemTitle(page.firstWorkItem)).toBe(WORK_ITEM_TITLE);
      /* Fill in/update the new work item's title and details field */
      expect(page.workItemTitle(page.workItemByTitle(WORK_ITEM_TITLE))).toBe(WORK_ITEM_TITLE);
      var detailPage = page.clickWorkItemTitle(WORK_ITEM_TITLE);
      browser.wait(until.elementToBeClickable(detailPage.workItemDetailAssigneeIcon), constants.WAIT, 'Failed to find Assignee Icon');
      detailPage.clickWorkItemDetailTitleClick();
      detailPage.setWorkItemDetailTitle (WORK_ITEM_UPDATED_TITLE, false);
      detailPage.clickWorkItemTitleSaveIcon();
      detailPage.clickWorkItemDescriptionEditIcon();
      detailPage.clickWorkItemDetailDescription()
      detailPage.setWorkItemDetailDescription (WORK_ITEM_UPDATED_DESCRIPTION, false);
      detailPage.clickWorkItemDescriptionSaveIcon();
      detailPage.clickWorkItemDetailCloseButton();
      browser.wait(until.presenceOf(page.workItemByTitle(WORK_ITEM_UPDATED_TITLE)), constants.WAIT, 'Failed to find workItemList');
      expect(page.workItemTitle(page.firstWorkItem)).toBe(WORK_ITEM_UPDATED_TITLE);
    });
  });

  //Commenting out this one - need to fix!
  /* Vary the order of execution of the workitems */
  // it('should top workitem to the bottom and back to the top via the workitem kebab', function() {
  //   page.allWorkItems.count().then(function (text) {
  //     var totalCount = text
  //     /* Verify that the first work item is in the correct position */
  //     expect(page.workItemTitle(page.workItemByIndex(0))).toBe(MOCK_WORKITEM_TITLE_0);
  //     compareWorkitems (page, 0, MOCK_WORKITEM_TITLE_0);
  //     /* Move the workitem to the bottom */
  //     page.clickWorkItemKebabButton (page.workItemByTitle(MOCK_WORKITEM_TITLE_0)).then(function() {
  //       page.clickWorkItemKebabMoveToBottomButton(page.workItemByTitle(MOCK_WORKITEM_TITLE_0));
  //       compareWorkitems (page, totalCount - 1, MOCK_WORKITEM_TITLE_0);
  //     });
  //   });
  // });

  /* Test that the Quick add work item is visible */
  it('Test Quick workitem not visible without authorization', function () {
    page.clickLogoutButton().click();
    expect(page.quickAddbuttonById().isPresent()).toBeFalsy();
  });

  /* Create workitem - verify user and icon */
  it('Edit and check WorkItem, creator name and image is reflected', function () {
    var detailPage = page.clickWorkItemTitle(MOCK_WORKITEM_TITLE_0);
    detailPage.clickWorkItemTitleDiv();
    detailPage.setWorkItemDetailTitle (WORK_ITEM_TITLE, false);
    detailPage.clickWorkItemTitleSaveIcon();
    detailPage.clickWorkItemDescriptionEditIcon();
    detailPage.clickWorkItemDetailDescription()
    detailPage.setWorkItemDetailDescription (WORK_ITEM_DESCRIPTION, true);
    detailPage.clickWorkItemDescriptionSaveIcon();
    expect(detailPage.getCreatorUsername()).toBe(EXAMPLE_USER_0);
    expect(detailPage.getCreatorAvatar().isPresent()).toBe(true);
    detailPage.clickWorkItemDetailCloseButton();

    expect(page.workItemTitle(page.workItemByTitle(WORK_ITEM_TITLE))).toBe(WORK_ITEM_TITLE);
    browser.wait(until.presenceOf(page.workItemByTitle(WORK_ITEM_TITLE)), constants.WAIT, 'Failed to find the Work Item');

    detailPage = page.clickWorkItemTitle(WORK_ITEM_TITLE);
    expect(detailPage.getCreatorUsername()).toBe(EXAMPLE_USER_0);
    expect(detailPage.getCreatorAvatar().isPresent()).toBe(true);
    expect(detailPage.getImageURL()).toBe('https://avatars.githubusercontent.com/u/2410471?v=3&s=20');
  });

  it('check date showing up correctly - Desktop', function () {
    var detailPage = page.clickWorkItemTitle(MOCK_WORKITEM_TITLE_0);
    browser.wait(until.elementToBeClickable(page.firstWorkItem), constants.WAIT, 'Failed to find workItem');
    expect(detailPage.getCreatedtime()).toBe('a few seconds ago');
    browser.wait(until.elementToBeClickable(detailPage.workItemDetailCloseButton), constants.WAIT, 'Failed to find close workItem detail page');
    detailPage.clickWorkItemDetailCloseButton();
  });

  it('Updating area to a WI -desktop ', function() {
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    browser.wait(until.elementToBeClickable(detailPage.areaLabel), constants.WAIT, 'Failed to find areaLabel');
    detailPage.clickAreaSelect();
    detailPage.clickAreas(WORKITEM_0_ID);
    expect(detailPage.saveAreasButton().isPresent()).toBe(true);
    detailPage.SaveAreas();

    browser.wait(until.elementToBeClickable(detailPage.AreaSelect()), constants.WAIT, 'Failed to find area');
    expect(detailPage.AreaSelect().getText()).toBe(AREA_0_TITLE);
    detailPage.clickAreaSelect();
    detailPage.clickAreas(WORKITEM_1_ID);

    detailPage.SaveAreas();
    browser.wait(until.elementToBeClickable(detailPage.AreaSelect()), constants.WAIT, 'Failed to find area');
    expect(detailPage.AreaSelect().getText()).toBe(AREA_1_TITLE);
  });

  it('Re-Associate Workitem from detail page', function() {
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.IterationOndetailPage().click();
    detailPage.associateIterationById("id1");
    detailPage.saveIteration();
    expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 1");
    detailPage.clickWorkItemDetailCloseButton();
    // Re - assocaite
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.IterationOndetailPage().click();
    detailPage.associateIterationById("id0");
    detailPage.saveIteration();
    expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 0");
    detailPage.clickWorkItemDetailCloseButton();
  });

  it('Try clicking on start coding it should redirect - Desktop', function () {
    var detailPage = page.clickWorkItemTitle(MOCK_WORKITEM_TITLE_0);
    expect(detailPage.startCodingElement.isPresent()).toBe(true);
    detailPage.clickStartCoding();
   });

  it('Edit comment and cancel - Desktop ', function() {
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.scrollToBottom()
      .then(function() {
        detailPage.commentEdit('0').click();
        detailPage.editComments('updated comment!','0',false);
        detailPage.scrollToBottom().then(function(){
          detailPage.clickCloseComment('0');
        });
        expect(detailPage.getCommentBody('0')).toBe('Some Comment 0');
      });
  });

  it('Verify create new Label', function(){
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.clickAddLabelButton();
    let origLabelCount
    detailPage.labelsCount.then(function(count){
      origLabelCount = count
    });
    detailPage.clickCreateLabelButton();
    detailPage.setLabelName(newLabelTitle);
    detailPage.clickLabelCheckbox();
    // Verify label count has increased by 1
    detailPage.labelsCount.then(function(count){
      expect(count).toBe(origLabelCount + 1);
    });
    // Verify label exists in the list
    expect(detailPage.listOfLabels().getText()).toContain(detailPage.getLabelByTitle(newLabelTitle).getText());
  })

  it('Verify added label appears on the list page', function(){
    var detailPage = page.clickWorkItem(page.firstWorkItem);
    detailPage.clickAddLabelButton();
    detailPage.selectLabelByTitle(testLabelTitle);
    detailPage.clickLabelClose();
    detailPage.clickWorkItemDetailCloseButton();
    expect(page.workItemAttachedLabels(page.firstWorkItem).getText()).toContain(testLabelTitle);
  });
  });

/* Compare an expected and actual work item - the offset values enable us to track
   workitems after they have been moved. */
  var compareWorkitems = function(page, targetIndex, expectedTitle) {
    expect(page.workItemTitle(page.workItemByIndex(targetIndex))).toBe(expectedTitle);
  }
