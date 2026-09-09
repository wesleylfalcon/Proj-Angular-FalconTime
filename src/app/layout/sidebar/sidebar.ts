// Core
import { Component } from '@angular/core';

// Router
import { RouterLink, RouterLinkActive } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {}
