import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VerificationService, VerificationState } from './verification.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  event = ''
  date: FormControl = new FormControl('');
  isAllowed: boolean = false;
  isDenied: boolean = false;
  isUnknown: boolean = true;

  constructor(private route: ActivatedRoute, private verificationService: VerificationService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.event = params['event'];
      this.verificationService.addEvent(this.event);
      this.verificationService.addCallback(this.event, this.onStateChange.bind(this));
      let date = localStorage.getItem(this.event);
      if (date) {
        this.date.setValue(date);
        this.verificationService.verify(this.event, this.date.value);
      }
    });
  }

  onStateChange(event: string, state: VerificationState): void {
    this.isAllowed = (state == VerificationState.Allowed);
    this.isDenied = (state == VerificationState.Denied);
    this.isUnknown = (state == VerificationState.Unknown || state == VerificationState.InProgress);
  }

  onSubmitClick(): void {
    localStorage.setItem(this.event, this.date.value);
    this.verificationService.verify(this.event, this.date.value);
  }
}
