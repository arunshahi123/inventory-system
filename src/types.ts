export type Role = "admin" | "staff";


export type InventoryItem = {
id: string;
name: string;
category: string;
stock: number;
unit: string;
price: number;
};


export type Sale = {
id: string;
itemId: string;
itemName: string;
quantity: number;
date: string;
};


export const uid = () => Math.random().toString(36).slice(2, 9);
export const todayISO = () => new Date().toISOString().slice(0, 10);