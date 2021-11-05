import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export class Image {
  id = '';
  datetime = '';
  thumbnail_dimensions: number[] = [0, 0];
  professional = false;
  tags: string[] = [];
}

export class ImageGrid extends Array<Array<Image>> {
  height: number[] = [];

  constructor(numberOfColums: number) {
    super();
    for (let index = 0; index < numberOfColums; index++) {
      this.push(new Array<Image>());
      this.height.push(0);
    }
  }

  populate(images: Array<Image>): void {
    images.forEach(image => {
      const index = this.height.indexOf(Math.min(...this.height));
      this.height[index] += image.thumbnail_dimensions[1];
      this[index].push(image);
    });
  }

}

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit {
  @Input() image: Image = new Image();
  path = '';
  hoveredOver = false;
  inPreview = false;
  loaded = false;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.path = '../../assets/thumbnails/' + this.image.id + '.jpg';
    this.route.queryParams.subscribe(queryParams => this.inPreview = 'view' in queryParams);
  }

  onMouseEnter(): void {
    this.hoveredOver = true;
  }

  onMouseLeave(): void {
    this.hoveredOver = false;
  }

  //onSelectClick(): void {
  //}

}
