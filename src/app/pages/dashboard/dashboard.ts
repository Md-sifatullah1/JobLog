import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  stats = [
    {
      label: 'Total Applications',
      value: '24'
    },
    {
      label: 'Interviews',
      value: '5'
    },
    {
      label: 'Offers',
      value: '2'
    },
    {
      label: 'Response Rate',
      value: '42%'
    }
    
  ];

}