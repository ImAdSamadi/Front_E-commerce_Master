import {Component, Input} from '@angular/core';
import {Category} from "../../../models/category.model";

@Component({
  selector: 'app-single-categorie',
  standalone: true,
  imports: [],
  templateUrl: './single-categorie.component.html',
  styleUrls: ['./single-categorie.component.css']
})
export class SingleCategorieComponent {




  // @ts-ignore
  @Input() category: Category;

}
