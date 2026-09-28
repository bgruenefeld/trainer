import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MitchellStore } from './core/application/mitchell-store';
import { TrainerStore } from './core/application/trainer-store';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly store = inject(TrainerStore);
  readonly progress = inject(MitchellStore);
  ngOnInit(): void {
    void this.reload();
  }
  async reload(): Promise<void> {
    await this.store.load();
    if (!this.store.error()) await this.progress.load();
  }
}
