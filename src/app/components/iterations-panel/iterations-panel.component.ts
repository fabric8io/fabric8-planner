import { FilterService } from './../../services/filter.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TreeNode } from 'angular2-tree-component';

import { Params, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy,
  TemplateRef, Input, OnChanges, ViewChild } from '@angular/core';

import { Broadcaster, Logger, Notification, NotificationType, Notifications } from 'ngx-base';
import { AuthenticationService } from 'ngx-login-client';
import { Space, Spaces } from 'ngx-fabric8-wit';
import { DragulaService } from 'ng2-dragula';

import { GroupTypesService } from '../../services/group-types.service';
import { IterationService } from '../../services/iteration.service';
import { WorkItemDataService } from './../../services/work-item-data.service';
import { WorkItemService }   from '../../services/work-item.service';
import { IterationModel } from '../../models/iteration.model';
import { WorkItem } from '../../models/work-item';

import { TreeListComponent } from 'ngx-widgets';

@Component({
  host: {
    'class':"app-component"
  },
  selector: 'fab-planner-iteration',
  templateUrl: './iterations-panel.component.html',
  styleUrls: ['./iterations-panel.component.less']
})
export class IterationComponent implements OnInit, OnDestroy, OnChanges {

  @Input() takeFromInput: boolean = false;
  @Input() iterations: IterationModel[] = [];

  @ViewChild('treeList') treeList: TreeListComponent;
  @ViewChild('treeListItemTemplate') treeListItemTemplate: TemplateRef<any>;
  @ViewChild('treeListLoadTemplate') treeListLoadTemplate: TemplateRef<any>;
  @ViewChild('treeListTemplate') treeListTemplate: TemplateRef<any>;
  @ViewChild('treeListItem') treeListItem: TreeListComponent;


  authUser: any = null;
  loggedIn: Boolean = true;
  editEnabled: Boolean = false;
  isBacklogSelected: Boolean = true;
  //isCollapsedIteration: Boolean = false;
  //isCollapsedCurrentIteration: Boolean = false;
  //isCollapsedFutureIteration: Boolean = true;
  //isCollapsedPastIteration: Boolean = true;
  barchatValue: number = 70;
  selectedIteration: IterationModel;
  allIterations: IterationModel[] = [];
  //futureIterations: IterationModel[] = [];
  //currentIterations: IterationModel[] = [];
  //closedIterations: IterationModel[] = [];
  eventListeners: any[] = [];
  currentSelectedIteration: string = '';
  dragulaEventListeners: any[] = [];
  masterIterations;
  treeIterations;

  private spaceSubscription: Subscription = null;

  // See: https://angular2-tree.readme.io/docs/options
  treeListOptions = {
    allowDrag: false,
    getChildren: (node: TreeNode): any => {
      return this.workItemService.getChildren(node.data);
    },
    levelPadding: 30,
    allowDrop: (element, to) => {
      // return true / false based on element, to.parent, to.index. e.g.
      return to.parent.hasChildren;
    }
  };

  constructor(
    private log: Logger,
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    private dragulaService: DragulaService,
    private filterService: FilterService,
    private groupTypesService: GroupTypesService,
    private iterationService: IterationService,
    private notifications: Notifications,
    private route: ActivatedRoute,
    private spaces: Spaces,
    private workItemDataService: WorkItemDataService,
    private workItemService: WorkItemService) {
      let bag: any = this.dragulaService.find('wi-bag');
      this.dragulaEventListeners.push(
        this.dragulaService.drop
        .map(value => value.slice(1))
        .filter(value => {
          return value[1].classList.contains('iteration-container') &&
                 !value[1].classList.contains('iteration-header');
        })
        .subscribe((args) => this.onDrop(args)),

        this.dragulaService.over
        .map(value => value.slice(1))
        .filter(value => {
          return value[1].classList.contains('iteration-container') ||
                 value[1].classList.contains('iteration-header');
        })
        .subscribe((args) => {
          this.onOver(args);
        }),

        this.dragulaService.out
        .map(value => value.slice(1))
        .filter(value => {
          return value[1].classList.contains('iteration-container');
        })
        .subscribe(args => {
          this.onOut(args);
        })
      );
      if(bag !== undefined) {
        this.dragulaService.destroy('wi-bag');
      }
      this.dragulaService.setOptions('wi-bag', {
        moves: (el, container, handle) => {
          return !container.classList.contains('iteration-container');
        }
      });
    }

  ngOnInit(): void {
    this.listenToEvents();
    this.loggedIn = this.auth.isLoggedIn();
    this.getAndfilterIterations();
    this.editEnabled = true;
    this.spaceSubscription = this.spaces.current.subscribe(space => {
      if (space) {
        console.log('[IterationComponent] New Space selected: ' + space.attributes.name);
        this.editEnabled = true;
        this.getAndfilterIterations();
      } else {
        console.log('[IterationComponent] Space deselected.');
        this.editEnabled = false;
        this.allIterations = [];
        console.log('....1 ', this.allIterations.length);
        // this.futureIterations = [];
        // this.currentIterations = [];
        // this.closedIterations = [];
      }
    });
  }

  ngOnChanges() {
    if (this.takeFromInput) {
      // do not display the root iteration on the iteration panel.
      this.allIterations = [];
      for (let i=0; i<this.iterations.length; i++) {
        if (!this.iterationService.isRootIteration(this.iterations[i])) {
          this.allIterations.push(this.iterations[i]);
        }
      }
      //this.clusterIterations();
      //Retain only the direct parent ID
      this.allIterations.forEach(iteration => {
        let path = iteration.attributes.parent_path.split('/');
        iteration.attributes.parent_path = path[path.length-1];
      });
      //Parse and create a format compatible with tree list
      this.masterIterations = this.allIterations.map(iteration => {
        let path = iteration.attributes.resolved_parent_path.split('/');
        //Store the depth - for the first time show iteration with the
        let obj = {
          id: iteration.id,
          name: iteration.attributes.name,
          hasChildren: false,
          children: [],
          depth: path.length - 1,
          parentId: iteration.attributes.parent_path
        };
        return obj;
      });
      //Set children and has children
      this.masterIterations.forEach(iteration => {
        //Find the children for the current ID
        iteration.children = this.masterIterations.filter(i => {
          return (i.parentId != '' &&
          i.parentId == iteration.id)
        });
        console.log('children', iteration.children);
        iteration.hasChildren = iteration.children.length > 0 ? true : false;
      });

      this.treeIterations = this.masterIterations.filter(iteration =>
        iteration.depth === 1);
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.spaceSubscription.unsubscribe();
    this.dragulaEventListeners.forEach(subscriber => subscriber.unsubscribe());
    this.eventListeners.forEach(subscriber => subscriber.unsubscribe());
  }

  constructURL(iterationId: string) {
    //return this.filterService.constructQueryURL('', {iteration_id: iterationId});
    //this.filterService.queryBuilder({}, '$IN',)
    const it_key = 'iteration';
    const it_compare = this.filterService.equal_notation;
    const it_value = iterationId;
    //Query for type
    const it_query = this.filterService.queryBuilder(it_key, it_compare, it_value);
    //Query for space
    //const space_query = this.filterService.queryBuilder('space',this.filterService.equal_notation, this.spaceId);
   //Join type and space query
   const first_join = this.filterService.queryJoiner({}, this.filterService.and_notation, it_query );
   //const second_join = this.filterService.queryJoiner(first_join, this.filterService.and_notation, type_query );
   //second_join gives json object
   return this.filterService.jsonToQuery(first_join);
   //reverse function jsonToQuery(second_join);
    //return '';
  }

  getAndfilterIterations() {
    if (this.takeFromInput) {
      // do not display the root iteration on the iteration panel.
      this.allIterations = [];
      for (let i=0; i<this.iterations.length; i++) {
        if (!this.iterationService.isRootIteration(this.iterations[i])) {
          this.allIterations.push(this.iterations[i]);
        }
      }
      //this.clusterIterations();
    } else {
      this.iterationService.getIterations()
        .subscribe((iterations) => {
          // do not display the root iteration on the iteration panel.
          this.allIterations = [];
          console.log('....5 ', this.allIterations.length);
          for (let i=0; i<iterations.length; i++) {
            if (!this.iterationService.isRootIteration(iterations[i])) {
              this.allIterations.push(iterations[i]);
            }
          }
          //this.clusterIterations();
        },
        (e) => {
          console.log('Some error has occured', e);
        });
    }
  }

  clusterIterations() {
    // this.futureIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'new');
    // this.currentIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'start');
    // this.closedIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'close');

    // if (this.futureIterations.find(it => this.resolvedName(it) == this.currentSelectedIteration)) {
    //   this.isCollapsedPastIteration = true;
    //   this.isCollapsedFutureIteration = false;
    // } else if (this.closedIterations.find(it => this.resolvedName(it) == this.currentSelectedIteration)) {
    //   this.isCollapsedFutureIteration = true;
    //   this.isCollapsedPastIteration = false;
    // }
  }

  resolvedName(iteration: IterationModel) {
    return iteration.attributes.resolved_parent_path + '/' + iteration.attributes.name;
  }

  onCreateOrupdateIteration(iteration: IterationModel) {
    let index = this.allIterations.findIndex((it) => it.id === iteration.id);
    if (index >= 0) {
      this.allIterations[index] = iteration;
    } else {
      this.allIterations.splice(this.allIterations.length, 0, iteration);
    }
    this.clusterIterations();
  }

  getWorkItemsByIteration(iteration: IterationModel) {
    let filters: any = [];
    if (iteration) {
      this.selectedIteration = iteration;
      this.isBacklogSelected = false;
      filters.push({
        id:  iteration.id,
        name: iteration.attributes.name,
        paramKey: 'filter[iteration]',
        active: true,
        value: iteration.id
      });
      // emit event
      this.broadcaster.broadcast('iteration_selected', iteration);
    } else {
      //This is to view the backlog
      this.selectedIteration = null;
      //this.isBacklogSelected = true;
      //Collapse the other iteration sets
      // this.isCollapsedCurrentIteration = true;
      // this.isCollapsedFutureIteration = true;
      // this.isCollapsedPastIteration = true;
      filters.push({
        paramKey: 'filter[iteration]',
        active: false,
      });
    }
    this.broadcaster.broadcast('unique_filter', filters);
  }

  updateItemCounts() {
    this.log.log('Updating item counts..');
    this.iterationService.getIterations().first().subscribe((updatedIterations:IterationModel[]) => {
      // updating the counts from the response. May not the best solution on performance right now.
      updatedIterations.forEach((thisIteration:IterationModel) => {
        for (let i=0; i<this.iterations.length; i++) {
          if (this.iterations[i].id === thisIteration.id) {
            this.iterations[i].relationships.workitems.meta.total = thisIteration.relationships.workitems.meta.total;
            this.iterations[i].relationships.workitems.meta.closed = thisIteration.relationships.workitems.meta.closed;
          }
        }
      });
    }, err => console.log(err));
  }

  onDrop(args) {
    let [el, target, source, sibling] = args;
    let iterationId = target.getAttribute('data-id');
    let workItemId = el.getAttribute('data-UUID');
    let reqVersion = el.getAttribute('data-version');
    let selfLink = el.getAttribute('data-selfLink');
    this.assignWIToIteration(workItemId, parseInt(reqVersion), iterationId, selfLink);
    target.classList.remove('on-hover-background');
  }

  onOver(args) {
    let [el, container, source] = args;
    el.classList.add('dn');
    if(container.classList.contains('future-iteration-header')) {
      //this.isCollapsedFutureIteration = false;
    } else if(container.classList.contains('past-iteration-header')) {
      //this.isCollapsedPastIteration = false;
    } else {
      container.classList.add('on-hover-background');
    }
  }

  onOut(args) {
    let [el, container, source] = args;
    container.classList.remove('on-hover-background');
  }

  assignWIToIteration(workItemId: string, reqVersion: number, iterationID: string, selfLink: string) {
    let workItemPayload: WorkItem = {
      id: workItemId,
      type: 'workitems',
      attributes: {
        'version': reqVersion
      },
      relationships: {
        iteration: {
          data: {
            id: iterationID,
            type: 'iteration'
          }
        }
      },
      links: {
        self: selfLink
      }
    } as WorkItem;

    this.workItemService.update(workItemPayload)
      .switchMap(item => {
        return this.iterationService.getIteration(item.relationships.iteration)
          .map(iteration => {
            item.relationships.iteration.data = iteration;
            return item;
          });
      })
      .subscribe(workItem => {
        this.workItemDataService.setItem(workItem);
        this.iterationService.emitDropWI(workItem);
        this.updateItemCounts();
        try {
        this.notifications.message({
            message: workItem.attributes['system.title']+' has been associated with '+workItem.relationships.iteration.data.attributes['name'],
            type: NotificationType.SUCCESS
          } as Notification);
        } catch(error) {
          console.log('Error in displaying notification. work item associated with iteration.');
        }
      },
      (err) => {
        this.iterationService.emitDropWI(workItemPayload, true);
        try {
          this.notifications.message({
            message: 'Something went wrong. Please try again',
            type: NotificationType.DANGER
          } as Notification);
        } catch(error) {
          console.log('Error in displaying notification. Error in work item association with iteration.');
        }
      })
  }

  kebabMenuClick(event: Event) {
    event.stopPropagation();
  }

  itemToggled(event: Event) {
    console.log('toggleeee');
  }

  itemSelected(event: Event) {
    console.log('selectedeeee');
  }

  listenToEvents() {
    this.eventListeners.push(
      this.broadcaster.on<string>('backlog_selected')
        .subscribe(message => {
          this.selectedIteration = null;
          this.isBacklogSelected = true;
      })
    );
    this.eventListeners.push(
      this.broadcaster.on<string>('logout')
        .subscribe(message => {
          this.loggedIn = false;
          this.authUser = null;
      })
    );
    this.eventListeners.push(
      this.broadcaster.on<string>('wi_change_state_it')
        .subscribe((actions: any) => {
          this.updateItemCounts();
      })
    );
    this.eventListeners.push(
      this.broadcaster.on<string>('associate_iteration')
        .subscribe((data: any) => {
          this.updateItemCounts();
      })
    );
    this.eventListeners.push(
      this.broadcaster.on<WorkItem>('delete_workitem')
        .subscribe((data: WorkItem) => {
          this.updateItemCounts();
      })
    );

    this.eventListeners.push(
      this.broadcaster.on<WorkItem>('create_workitem')
        .subscribe((data: WorkItem) => {
          this.updateItemCounts();
      })
    );
  }
 }
