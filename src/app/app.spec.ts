import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { MitchellStore } from './core/application/mitchell-store';
import { App } from './app';
import { TrainerStore } from './core/application/trainer-store';
describe('App-Speicherfehler', () => {
  it('zeigt einen Fehler und ermöglicht erneutes Laden ohne UI-Absturz', async () => {
    const store = {
      loading: signal(false),
      error: signal('Speicher nicht erreichbar'),
      load: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: TrainerStore, useValue: store },
        {
          provide: MitchellStore,
          useValue: { loading: signal(false), error: signal(''), load: vi.fn() },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Speicher nicht erreichbar');
    fixture.nativeElement.querySelector('button').click();
    expect(store.load).toHaveBeenCalledTimes(2);
  });
});
