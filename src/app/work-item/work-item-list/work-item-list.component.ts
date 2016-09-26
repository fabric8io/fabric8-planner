import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { Logger } from '../../shared/logger.service';
import { WorkItem } from '../work-item';
import { WorkItemService } from '../work-item.service';
import { DropdownComponent } from './../../shared-component/dropdown/dropdown.component';
import { DropdownOption } from './../../shared-component/dropdown/dropdown-option';

@Component({
  selector: 'work-item-list',
  templateUrl: './work-item-list.component.html',
  styleUrls: ['./work-item-list.component.scss'],
})
export class WorkItemListComponent implements OnInit {
  workItems: WorkItem[];
  selectedWorkItem: WorkItem;
  addingWorkItem = false;

  stateDropdownOptions: DropdownOption[];

  constructor(
    private router: Router,
    private workItemService: WorkItemService,
    private logger: Logger) {

  }

  ngOnInit(): void {
    this.getOptions();
    this.getWorkItems();
  }

  getOptions(): void {
    this.stateDropdownOptions = this.workItemService.getStatusOptions();
  }

  getWorkItems(): void {
    this.workItemService
      .getWorkItems()
      .then(workItems => this.workItems = workItems.reverse());
  }

  addWorkItem(): void {
    this.addingWorkItem = true;
    this.selectedWorkItem = null;
  }

  close(savedWorkItem: WorkItem) {
    this.addingWorkItem = false;
    if (savedWorkItem) { this.getWorkItems(); }
  }

  onStateUpdate(val: any) {
    let index = this.workItems.findIndex((item) => {
      return item.id == val.currentOption.extra_params.workItem_id;
    });
    this.workItems[index].fields["system.state"] = val.newOption.option;
    this.workItems[index].statusCode = val.newOption.id;
    this.workItemService
      .update(this.workItems[index])
      .then((updatedWorkItem) => {
        this.workItems[index] = updatedWorkItem;
      });
  }

  deleteWorkItem(workItem: WorkItem): void {
    this.workItemService
      .delete(workItem)
      .then(() => {
        this.workItems = this.workItems.filter(h => h !== workItem);
        if (this.selectedWorkItem === workItem) { this.selectedWorkItem = null; }
      });
  }

  onSelect(workItem: WorkItem): void {
    this.selectedWorkItem = workItem;
  }

  gotoDetail(workItem: WorkItem): void {
    this.selectedWorkItem = workItem;
    this.router.navigate(['/detail', this.selectedWorkItem.id]);
  }
}
