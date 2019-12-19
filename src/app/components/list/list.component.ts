import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { AttachSession } from 'protractor/built/driverProviders';
import { Placeholder } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

//creating array for tasks
items = [];
@Input('title') title: string;
@Input('list') list: string;
@Input('allowDone') allowDone: boolean;
@Input('allowCrit') allowCrit: boolean;
@Input('allowLater') allowLater: boolean;
loading = true;

constructor(private afAuth: AngularFireAuth, private db: AngularFirestore,
   private alertCtrl: AlertController,) {
    console.log(this.list);
    }
    
//taking the input and moving it to the app from firebase so it can be displayed 

ngOnInit() {
  this.afAuth.authState.subscribe(user => {
    if (!user)
      return;
    this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${this.list}`, ref => {
      //this is ordering the tasks in terms of position, so that the oldest tasks are first
      return ref.orderBy('pos', 'desc');
    }).snapshotChanges().subscribe(colSnap => {
      this.items = [];
      //assigning each task an ID so they can be manipulated
      colSnap.forEach(a => {
        let item = a.payload.doc.data();
        item['id'] = a.payload.doc.id;
        this.items.push(item);
      });
      this.loading = false;
    });
  });
}
//this is the add button for when a new task is being added
async add() {
  const alert = await this.alertCtrl.create({
    header: 'New Task',
    message:'Insert details below:',
    buttons:[
      {
        //this is the cancel button for when a new task is being canceled
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Add',
        handler: (val) => {
          console.log('Confirm Add');
          //adding a time stamp as to when the task was added
          let now = new Date();
          let nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
          now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
          //sending the task to the firbase database
          this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${this.list}`).add({
            text: val.task,
            //asigning the task a position number, so that they can be ordered, it checks to see if there are any existing tasks and what their numbers are. If there arent, it starts at 0
            pos: this.items.length ? this.items[0].pos + 1 : 0,
            created: nowUtc,
          });
        }
      }
    ],
    inputs: [
      {
        name: 'task',
        type: "text",
        placeholder: 'My Task',
      },
    ],
  });
  return await alert.present();
}
//deleting files from todays tasks
delete(item){
  this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${this.list}/${item.id}`).delete()
}
crit(item) {
  this.moveItem(item, 'crit');
}
  //moving tasks to completed, and deleting them from todays tab
complete(item) {
  //calling the move item function
  this.moveItem(item, 'done');
}

//moving tasks to later tab, and deleting them from todays tab
later(item){
  //calling the move item function
  this.moveItem(item, 'later');
}
//function which will move items efficiently
moveItem(item, list: string){
  this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${this.list}/${item.id}`).delete();
  //storing task ID in a temp variable before it is deleted from todays task, meanind the variable can be reassigned its ID
  let id = item.id;
  delete item.id;
  // this is looking at the entire collection, so that the task can be reasigned a position number and put in the correct place.
  this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${list}`, ref => {
    //the limit(1) function ensures that only the newest item in the lsit is looked at
    return ref.orderBy('pos','desc').limit(1);
  }).get().toPromise().then(qSnap => {
    //the line below sets the pos to 0, and the next lines check to see if there is items in the list. If htere are, the 0 gets over written and the item that is being moved is assigned the correct pos number.
    item.pos = 0;
    qSnap.forEach(a => {
      item.pos = a.data().pos + 1;
    });
  this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${list}/${item.id}`).set(item);
  });
}
}
