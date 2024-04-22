import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
	selector: 'app-product-list',
	templateUrl: './product-list-grid.component.html',
	styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
	products: Product[] = [];
	currentCategoryId: number = 1;
	previousCategoryId: number = 1;
	searchMode: boolean = false;

	// pagination prop
	thePageNumber: number = 1;
	thePageSize: number = 5;
	theTotalElements: number = 0;

	previousKeyword: String = '';

	constructor(
		private productService: ProductService,
		private cartService: CartService,
		private route: ActivatedRoute,
	) {}

	ngOnInit(): void {
		this.route.paramMap.subscribe(() => {
			this.listProducts();
		});
	}

	listProducts() {
		this.searchMode = this.route.snapshot.paramMap.has('keyword');

		if (this.searchMode) {
			this.handleSearchProducts();
		} else {
			this.handleListProducts();
		}
	}

	handleSearchProducts() {
		const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

		if (this.previousKeyword != theKeyword) {
			this.thePageNumber = 1;
		}

		this.previousKeyword = theKeyword;

		console.log(`keyword = ${theKeyword}, page num = ${this.thePageNumber}`);

		// search using keyword
		this.productService
			.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword)
			.subscribe(this.processResult());
	}

	handleListProducts() {
		// check if "id" is available
		const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

		if (hasCategoryId) {
			// get id string and convert to number
			this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
		} else {
			// no category avail, defaults to 1
			this.currentCategoryId = 1;
		}

		// check if have different category id than previous

		// if different, reset page number to 1
		if (this.previousCategoryId != this.currentCategoryId) {
			this.thePageNumber = 1;
		}

		this.previousCategoryId = this.currentCategoryId;
		console.log(
			`current category = ${this.currentCategoryId}, page num = ${this.thePageNumber}`
		);

		// get the products for the given cat id
		// page number - 1 bcz the backend pagination starts from 0 while the angular pagination starts from 1
		this.productService
			.getProductListPaginate(
				this.thePageNumber - 1,
				this.thePageSize,
				this.currentCategoryId
			)
			.subscribe(this.processResult());
	}

	updatePageSize(pageSize: string) {
		this.thePageSize = +pageSize;
		this.thePageNumber = 1;
		this.listProducts();
	}

	processResult() {
		return (data: any) => {
			this.products = data._embedded.products;
			this.thePageNumber = data.page.number + 1;
			this.thePageSize = data.page.size;
			this.theTotalElements = data.page.totalElements;
		};
	}

	addToCart(theProduct: Product) {
		console.log(`Adding to cart: ${theProduct.name}`);

		const theCartItem = new CartItem(theProduct);

		this.cartService.addToCart(theCartItem);
	}
}
