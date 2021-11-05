import { Component, HostListener, OnInit } from '@angular/core';
import { ImageGrid } from '../image/image.component';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../event/event.service';
import { VerificationService, VerificationState } from '../verification/verification.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  event = '';
  inPreview = false;
  isAllowed = false;
  imageGridExtraLarge = new ImageGrid(4);
  imageGridLarge = new ImageGrid(3);
  imageGridMedium = new ImageGrid(2);
  imageGridSmall = new ImageGrid(1);

  constructor(private route: ActivatedRoute, private eventService: EventService, private verificationService: VerificationService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.event = params['event'];
      this.verificationService.addCallback(this.event, this.onStateChanged.bind(this));
      const imageList = this.eventService.getImages(params['event']);
      imageList.then(images => this.imageGridExtraLarge.populate(images));
      imageList.then(images => this.imageGridLarge.populate(images));
      imageList.then(images => this.imageGridMedium.populate(images));
      imageList.then(images => this.imageGridSmall.populate(images));
    });
    this.route.queryParams.subscribe(queryParams => this.inPreview = 'view' in queryParams);
  }

  onStateChanged(event: string, state: VerificationState): void {
    this.isAllowed = (state == VerificationState.Allowed);
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: PointerEvent): void {
    event.preventDefault();
  }

}
