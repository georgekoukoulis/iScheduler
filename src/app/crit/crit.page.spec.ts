import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CritPage } from './crit.page';

describe('CritPage', () => {
  let component: CritPage;
  let fixture: ComponentFixture<CritPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CritPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CritPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
