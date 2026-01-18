import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit action when button is clicked', () => {
    spyOn(component.action, 'emit');
    component.actionText = 'Test Action';
    fixture.detectChanges();
    
    component.onActionClick();
    
    expect(component.action.emit).toHaveBeenCalled();
  });

  it('should use default values when inputs are not provided', () => {
    expect(component.icon).toBe('inbox');
    expect(component.title).toBe('No items found');
    expect(component.size).toBe('medium');
  });
});
