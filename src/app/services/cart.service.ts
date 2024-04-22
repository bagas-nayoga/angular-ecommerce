import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CartService {
	cartItems: CartItem[] = [];

	totalPrice: Subject<number> = new Subject<number>();
	totalQuantity: Subject<number> = new Subject<number>();

	constructor() {}

	addToCart(theCartItem: CartItem) {
		// check whether item inserted is already exists
		let alreadyExistInCart: boolean = false;
		let existingCartItem: CartItem | undefined = undefined;

		if (this.cartItems.length > 0) {
			// find the item in cart
			existingCartItem = this.cartItems.find((temp) => temp.id === theCartItem.id);

			// check if found
			alreadyExistInCart = existingCartItem != undefined;
		}

		if (alreadyExistInCart) {
			// increment the qty
			existingCartItem!.quantity++;
		} else {
			// add the item to array
			this.cartItems.push(theCartItem);
		}

		// compute cart total price and qty
		this.computeCartTotals();
	}

	computeCartTotals() {
		let totalPriceValue: number = 0;
		let totalQuantityValue: number = 0;

		for (let currentCartItem of this.cartItems) {
			totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
			totalQuantityValue += currentCartItem.quantity;
		}

		// publish all value, all subscriber will receive the new data
		this.totalPrice.next(totalPriceValue);
		this.totalQuantity.next(totalQuantityValue);

		// log cart
		this.logCartData(totalPriceValue, totalQuantityValue);
	}

	logCartData(totalPriceValue: number, totalQuantityValue: number) {
		console.log('Content of cart');
		for (let temp of this.cartItems) {
			const subTotalPrice = temp.quantity * temp.unitPrice;
			console.log(
				`name: ${temp.name}, qty: ${temp.quantity}, price: ${temp.unitPrice}, sub total price: ${subTotalPrice}`
			);
		}

		console.log(
			`total price: ${totalPriceValue.toFixed(
				2
			)}, total qty: ${totalQuantityValue}`
		);
		console.log('-------------------');
	}
}
