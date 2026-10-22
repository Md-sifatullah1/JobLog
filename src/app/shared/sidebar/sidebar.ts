import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  LucideLayoutDashboard,
  LucideBriefcaseBusiness,
  LucideCalendarDays,
  LucideFileText,
  LucideChartNoAxesCombined
} from '@lucide/angular';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideBriefcaseBusiness,
    LucideCalendarDays,
    LucideFileText,
    LucideChartNoAxesCombined
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {

}