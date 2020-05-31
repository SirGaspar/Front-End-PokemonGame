import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogChatComponent } from './log-chat.component';

describe('LogChatComponent', () => {
  let component: LogChatComponent;
  let fixture: ComponentFixture<LogChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
