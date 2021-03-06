import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoginPage } from './login/login.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  loginModal;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private router: Router,
  
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      //checks to see if a user is already logged in
      this.afAuth.authState.subscribe(user => {
        //if no user is logged in, they are directed to the log in page
        if (!user) {
          this.router.navigateByUrl('/login');
          }
        //if they are logged in, they are redirected to their tabs page
        else {
          this.router.navigateByUrl('/tabs');   
        }
      });
    });
  }
}



