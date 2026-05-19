/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginCredintials {
  email: string;
  password: string;
}

export interface Bag {
  _id?: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  quantity: number;
}

export interface OrderItem {
  bagId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  name: string;
  email: string;
  address: string;
  cartItems: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
}
  